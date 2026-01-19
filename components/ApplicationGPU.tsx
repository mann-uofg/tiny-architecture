import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, MonitorPlay, Activity } from 'lucide-react';
import { Delaunay } from 'd3-delaunay';

type LowPolyTri = {
  x1: number; y1: number;
  x2: number; y2: number;
  x3: number; y3: number;
  color: string;
  // Higher = more likely on an edge/feature. We reveal these first.
  priority: number;
};

type ScaledTri = {
  x1: number; y1: number;
  x2: number; y2: number;
  x3: number; y3: number;
  color: string;
  priority: number;
};

const ApplicationGPU: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const SCENE_IMAGE = "/scene-realistic.jpg";

  // Use refs for animation loop state (time-based)
  const progressRef = useRef(0);
  const holdStartRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // UI State synced with ref
  const [frameProgress, setFrameProgress] = useState(0);

  // Static Geometry Refs (normalized 0..1)
  const lowPolyRef = useRef<LowPolyTri[]>([]);
  const gridPointsRef = useRef<{ x: number; y: number }[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageReadyRef = useRef(false);

  // Cached scaled geometry (pixels) for current viewport size (perf)
  const scaledTrisRef = useRef<ScaledTri[]>([]);
  const scaledPtsRef = useRef<{ x: number; y: number }[]>([]);
  const viewportSizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Simulation State
  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    vram: 0,
    gpuLoad: 0,
    computeTops: 0,
    temp: 45,
    clock: 2100,
    stageText: '',
    stageSub: '',
    execUnit: '',
    gpuName: ''
  });

  // GPU Specs (RTX 5090-class Simulation)
  const GPU_NAME = "NVIDIA RTX™ 5090 (32GB GDDR7)";
  const TOTAL_VRAM = 32;

  const STAGES = useMemo(() => ([
    { text: "INPUT ASSEMBLER", sub: "FETCHING VERTICES", unit: "Front-End / Input Assembler" },
    { text: "GEOMETRY ENGINE", sub: "PRIMITIVE ASSEMBLY + TESSELLATION", unit: "Geometry / Tessellation Units" },
    { text: "RASTERIZER", sub: "TILE BINNING + DEPTH TEST", unit: "Raster + ROPs" },
    { text: "PIXEL SHADER", sub: "LIGHTING + RT + DLSS", unit: "SMs + RT Cores + Tensor Cores" }
  ]), []);

  // Initialize Static Geometry Once
  useEffect(() => {
    const img = new Image();
    img.src = SCENE_IMAGE;
    img.onload = () => {
      imageRef.current = img;
      imageReadyRef.current = true;
      buildLowPolyMesh();
      rebuildScaledGeometry(); // ensure first draw uses scaled cache
    };
  }, [SCENE_IMAGE]);

  const rebuildScaledGeometry = () => {
    const vp = viewportRef.current;
    const canvas = canvasRef.current;
    if (!vp || !canvas) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.max(1, Math.floor(vp.clientWidth));
    const h = Math.max(1, Math.floor(vp.clientHeight));

    // Only rebuild if size really changed
    const prev = viewportSizeRef.current;
    if (prev.w === w && prev.h === h && prev.dpr === dpr && scaledTrisRef.current.length) return;

    viewportSizeRef.current = { w, h, dpr };

    // HiDPI canvas
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    // Scale cached geometry in CSS pixel coordinates (we'll set transform on ctx)
    scaledPtsRef.current = gridPointsRef.current.map(p => ({ x: p.x * w, y: p.y * h }));
    scaledTrisRef.current = lowPolyRef.current.map(t => ({
      x1: t.x1 * w, y1: t.y1 * h,
      x2: t.x2 * w, y2: t.y2 * h,
      x3: t.x3 * w, y3: t.y3 * h,
      color: t.color,
      priority: t.priority
    }));
  };

  // Keep canvas size + scaled geometry updated on resize
  useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => rebuildScaledGeometry());
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const buildLowPolyMesh = () => {
    const img = imageRef.current;
    if (!img) return;

    // Downscale for analysis (faster + stable)
    const ANALYZE_W = 480;
    const ANALYZE_H = 270;

    const off = document.createElement('canvas');
    off.width = ANALYZE_W;
    off.height = ANALYZE_H;
    const offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offCtx.drawImage(img, 0, 0, ANALYZE_W, ANALYZE_H);
    const rgba = offCtx.getImageData(0, 0, ANALYZE_W, ANALYZE_H).data;

    // Grayscale
    const gray = new Float32Array(ANALYZE_W * ANALYZE_H);
    for (let i = 0; i < ANALYZE_W * ANALYZE_H; i++) {
      const r = rgba[i * 4 + 0];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      gray[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Sobel edge magnitude
    const grad = new Float32Array(ANALYZE_W * ANALYZE_H);
    let maxG = 1e-6;
    const idx = (x: number, y: number) => y * ANALYZE_W + x;

    for (let y = 1; y < ANALYZE_H - 1; y++) {
      for (let x = 1; x < ANALYZE_W - 1; x++) {
        const g00 = gray[idx(x - 1, y - 1)];
        const g10 = gray[idx(x, y - 1)];
        const g20 = gray[idx(x + 1, y - 1)];
        const g01 = gray[idx(x - 1, y)];
        const g21 = gray[idx(x + 1, y)];
        const g02 = gray[idx(x - 1, y + 1)];
        const g12 = gray[idx(x, y + 1)];
        const g22 = gray[idx(x + 1, y + 1)];

        const gx = (-1 * g00) + (1 * g20) + (-2 * g01) + (2 * g21) + (-1 * g02) + (1 * g22);
        const gy = (-1 * g00) + (-2 * g10) + (-1 * g20) + (1 * g02) + (2 * g12) + (1 * g22);

        const m = Math.hypot(gx, gy);
        grad[idx(x, y)] = m;
        if (m > maxG) maxG = m;
      }
    }

    const gradAt = (u: number, v: number) => {
      const x = Math.max(0, Math.min(ANALYZE_W - 1, Math.floor(u * (ANALYZE_W - 1))));
      const y = Math.max(0, Math.min(ANALYZE_H - 1, Math.floor(v * (ANALYZE_H - 1))));
      return grad[idx(x, y)] / maxG; // 0..1
    };

    const sampleColor = (u: number, v: number) => {
      const x = Math.max(0, Math.min(ANALYZE_W - 1, Math.floor(u * (ANALYZE_W - 1))));
      const y = Math.max(0, Math.min(ANALYZE_H - 1, Math.floor(v * (ANALYZE_H - 1))));
      const i = (y * ANALYZE_W + x) * 4;
      return `rgb(${rgba[i]}, ${rgba[i + 1]}, ${rgba[i + 2]})`;
    };

    // Edge-aware point sampling
    const EDGE_SAMPLES = 1400;
    const FILL_SAMPLES = 500;
    const BORDER_SAMPLES = 180;

    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < BORDER_SAMPLES; i++) {
      const t = i / (BORDER_SAMPLES - 1);
      pts.push({ x: t, y: 0 });
      pts.push({ x: t, y: 1 });
    }
    for (let i = 1; i < BORDER_SAMPLES - 1; i++) {
      const t = i / (BORDER_SAMPLES - 1);
      pts.push({ x: 0, y: t });
      pts.push({ x: 1, y: t });
    }

    const edgeGamma = 1.6;
    let tries = 0;
    while (pts.length < (BORDER_SAMPLES * 4 + EDGE_SAMPLES) && tries < EDGE_SAMPLES * 40) {
      tries++;
      const u = Math.random();
      const v = Math.random();
      const g = gradAt(u, v);
      const p = Math.pow(g, edgeGamma);
      if (Math.random() < p) pts.push({ x: u, y: v });
    }

    for (let i = 0; i < FILL_SAMPLES; i++) {
      pts.push({ x: Math.random(), y: Math.random() });
    }

    // De-dupe
    const seen = new Set<string>();
    const points: { x: number; y: number }[] = [];
    for (const p of pts) {
      const qx = Math.round(p.x * 1200) / 1200;
      const qy = Math.round(p.y * 1200) / 1200;
      const key = `${qx},${qy}`;
      if (seen.has(key)) continue;
      seen.add(key);
      points.push({ x: qx, y: qy });
    }

    const delaunay = Delaunay.from(points, p => p.x, p => p.y);
    const tIdx = delaunay.triangles;

    const tris: LowPolyTri[] = [];
    for (let i = 0; i < tIdx.length; i += 3) {
      const a = points[tIdx[i]];
      const b = points[tIdx[i + 1]];
      const c = points[tIdx[i + 2]];
      if (!a || !b || !c) continue;

      const cx = (a.x + b.x + c.x) / 3;
      const cy = (a.y + b.y + c.y) / 3;

      tris.push({
        x1: a.x, y1: a.y,
        x2: b.x, y2: b.y,
        x3: c.x, y3: c.y,
        color: sampleColor(cx, cy),
        priority: gradAt(cx, cy)
      });
    }

    tris.sort((t1, t2) => t2.priority - t1.priority);

    lowPolyRef.current = tris;
    gridPointsRef.current = points;
  };

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

    // Slower + consistent across devices
    const FRAME_MS = 14000; // 14s for 0..100
    const HOLD_MS = 3500;

    const animate = (time: number) => {
      if (isPlaying) {
        // Ensure cached scaling stays correct (covers first paint + sporadic layout shifts)
        rebuildScaledGeometry();

        const last = lastTimeRef.current ?? time;
        const dt = Math.min(50, Math.max(0, time - last)); // clamp dt for stability
        lastTimeRef.current = time;

        let p = progressRef.current;

        if (p < 100) {
          p += (dt * 100) / FRAME_MS;
          if (p >= 100) p = 100;
          progressRef.current = p;
          holdStartRef.current = null;
        } else {
          if (holdStartRef.current === null) holdStartRef.current = time;
          if (time - holdStartRef.current > HOLD_MS) {
            progressRef.current = 0;
            p = 0;
            holdStartRef.current = null;
          }
        }

        setFrameProgress(p);

        const phase = p < 25 ? 0 : p < 50 ? 1 : p < 75 ? 2 : 3;
        const phaseT = clamp((p - phase * 25) / 25, 0, 1);

        const renderFrac =
          phase === 0 ? 0.15 * phaseT :
          phase === 1 ? 0.25 + 0.25 * phaseT :
          phase === 2 ? 0.50 + 0.50 * phaseT :
          1.0;

        const ranges = [
          { fps: [140, 120], draws: [1200, 2800], tris: [0.8, 1.5], vram: [7.5, 10.0], tops: [120, 220], load: [35, 55], clk: [2950, 2900], temp: [56, 60] },
          { fps: [120, 105], draws: [2800, 8000], tris: [1.5, 7.2], vram: [10.0, 18.5], tops: [220, 380], load: [55, 80], clk: [2900, 2875], temp: [60, 66] },
          { fps: [105, 90],  draws: [8000, 11000], tris: [7.2, 8.5], vram: [18.5, 25.5], tops: [380, 650], load: [80, 92], clk: [2875, 2825], temp: [66, 72] },
          { fps: [90, 72],   draws: [11000, 12500], tris: [8.5, 8.5], vram: [25.5, 31.5], tops: [650, 1050], load: [92, 99], clk: [2825, 2760], temp: [72, 78] }
        ];

        const r = ranges[phase];
        const jitter = (amp: number) => Math.sin(time / 220) * amp;

        const fps = lerp(r.fps[0], r.fps[1], phaseT) + jitter(1.6);
        const frameTime = Number((1000 / fps).toFixed(2));

        setStats({
          fps,
          frameTime,
          drawCalls: Math.floor(lerp(r.draws[0], r.draws[1], phaseT) * renderFrac),
          triangles: Math.floor(lerp(r.tris[0], r.tris[1], phaseT) * 1_000_000 * renderFrac),
          vram: clamp(lerp(r.vram[0], r.vram[1], phaseT) * renderFrac + Math.random() * 0.12, 0, 31.9),
          gpuLoad: Math.floor(lerp(r.load[0], r.load[1], phaseT) * (0.75 + 0.25 * renderFrac)),
          computeTops: Math.floor(lerp(r.tops[0], r.tops[1], phaseT) * renderFrac),
          temp: Math.floor(lerp(r.temp[0], r.temp[1], phaseT)),
          clock: Math.floor(lerp(r.clk[0], r.clk[1], phaseT)),
          stageText: STAGES[phase].text,
          stageSub: STAGES[phase].sub,
          execUnit: STAGES[phase].unit,
          gpuName: GPU_NAME
        });

        drawCanvas(phase, p);
      } else {
        lastTimeRef.current = null;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, GPU_NAME, STAGES]);

  const drawCanvas = (phase: number, p: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { dpr } = viewportSizeRef.current;
    // Draw in CSS pixels, map to device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = viewportSizeRef.current.w;
    const h = viewportSizeRef.current.h;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);
    if (!imageReadyRef.current) return;

    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const smoothstep = (a: number, b: number, t: number) => {
      const x = clamp01((t - a) / (b - a));
      return x * x * (3 - 2 * x);
    };

    // Using cached scaled geometry for perf
    const pts = scaledPtsRef.current;
    const tris = scaledTrisRef.current;

    // Stage 0: vertex points
    if (phase === 0) {
      ctx.fillStyle = 'rgba(16,185,129,0.9)';
      for (const pt of pts) ctx.fillRect(pt.x, pt.y, 2, 2);
      return;
    }

    // Stage 1: progressive wireframe (don’t draw all triangles every frame)
    if (phase === 1) {
      const t = clamp01((p - 25) / 25);
      const count = Math.floor(tris.length * (0.12 + 0.88 * t));
      ctx.strokeStyle = 'rgba(16,185,129,0.55)';
      ctx.lineWidth = 0.7;

      for (let i = 0; i < count; i++) {
        const tri = tris[i];
        ctx.beginPath();
        ctx.moveTo(tri.x1, tri.y1);
        ctx.lineTo(tri.x2, tri.y2);
        ctx.lineTo(tri.x3, tri.y3);
        ctx.closePath();
        ctx.stroke();
      }
      return;
    }

    // Stage 2: rasterization (progressive triangle reveal)
    if (phase === 2) {
      const t = clamp01((p - 50) / 25);
      const reveal = smoothstep(0, 1, t);
      const count = Math.floor(tris.length * reveal);

      // Make the triangles easier to see (less transparent early)
      const baseAlpha = 0.22 + 0.78 * reveal;

      ctx.imageSmoothingEnabled = true;

      for (let i = 0; i < count; i++) {
        const tri = tris[i];

        // Reduce “popping”
        const local = i / Math.max(1, count);
        const a = 0.35 + 0.65 * smoothstep(0, 1, local);

        ctx.globalAlpha = baseAlpha * a;

        ctx.beginPath();
        ctx.moveTo(tri.x1, tri.y1);
        ctx.lineTo(tri.x2, tri.y2);
        ctx.lineTo(tri.x3, tri.y3);
        ctx.closePath();
        ctx.fillStyle = tri.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Light edges
      ctx.strokeStyle = 'rgba(0,0,0,0.10)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < count; i++) {
        const tri = tris[i];
        ctx.beginPath();
        ctx.moveTo(tri.x1, tri.y1);
        ctx.lineTo(tri.x2, tri.y2);
        ctx.lineTo(tri.x3, tri.y3);
        ctx.closePath();
        ctx.stroke();
      }
      return;
    }

    // Stage 3: resolve (fade triangles out; final image fades in via JSX)
    if (phase === 3) {
      const t = clamp01((p - 75) / 25);
      const fadeOut = 1 - smoothstep(0, 1, t);
      if (fadeOut <= 0.01) return;

      ctx.globalAlpha = 0.75 * fadeOut;
      for (const tri of tris) {
        ctx.beginPath();
        ctx.moveTo(tri.x1, tri.y1);
        ctx.lineTo(tri.x2, tri.y2);
        ctx.lineTo(tri.x3, tri.y3);
        ctx.closePath();
        ctx.fillStyle = tri.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  };

  const getStageLabel = () => {
    if (frameProgress < 25) return { text: STAGES[0].text, sub: STAGES[0].sub };
    if (frameProgress < 50) return { text: STAGES[1].text, sub: STAGES[1].sub };
    if (frameProgress < 75) return { text: STAGES[2].text, sub: STAGES[2].sub };
    if (frameProgress < 100) return { text: STAGES[3].text, sub: STAGES[3].sub };
    return { text: "FRAME COMPLETE", sub: "PRESENTING TO DISPLAY" };
  };

  // Crossfade: keep the photo visible throughout, but “resolve” it late.
  const finalT = Math.max(0, Math.min(1, (frameProgress - 75) / 25));
  const imageOpacity = 0.35 + 0.65 * finalT;      // visible even early
  const canvasOpacity = frameProgress < 75 ? 1 : (1 - finalT); // fade triangles out at the end

  return (
    <div className="bg-slate-950 blueprint-border p-6 h-full flex flex-col text-slate-100 font-mono relative overflow-hidden">
      {/* Header (restores "panel" feel like before) */}
      <div className="mb-4 flex items-end justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-600 text-white p-2 rounded-md shadow-lg shadow-emerald-900/30">
              <MonitorPlay size={18} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Real-World GPU Rendering</h3>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl">
            Edge-aware triangulation + progressive raster reveal, with stage-correlated telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="text-xs text-slate-400">
            <div className="font-bold tracking-widest">PIPELINE</div>
            <div className="text-slate-500">{getStageLabel().text}</div>
          </div>
        </div>
      </div>

      {/* Viewport */}
      <div ref={viewportRef} className="flex-1 relative bg-black border-2 border-slate-800 rounded overflow-hidden">
        {/* Photo layer (so the image is actually visible) */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${SCENE_IMAGE})`,
            opacity: imageOpacity,
            filter: `blur(${(1 - finalT) * 1.25}px) contrast(${1.12 - (finalT * 0.12)}) saturate(${0.9 + 0.1 * finalT})`,
            transform: 'scale(1.02)'
          }}
        />

        {/* Triangulation canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ opacity: canvasOpacity }}
        />

        {/* Top stats strip (less intrusive) */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded bg-black/50 border border-white/10 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400">GPU</div>
              <div className="text-xs text-white truncate">{stats.gpuName}</div>
            </div>
            <div className="rounded bg-black/50 border border-white/10 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Exec Unit</div>
              <div className="text-xs text-white truncate">{stats.execUnit}</div>
            </div>
            <div className="rounded bg-black/50 border border-white/10 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400">FPS / ms</div>
              <div className="text-xs text-white">{stats.fps.toFixed(1)} / {stats.frameTime.toFixed(2)}</div>
            </div>
            <div className="rounded bg-black/50 border border-white/10 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase text-slate-400">VRAM</div>
              <div className="text-xs text-white">{stats.vram.toFixed(1)} GB ({Math.round((stats.vram / TOTAL_VRAM) * 100)}%)</div>
            </div>
          </div>
        </div>

        {/* Bottom control bar (restores previous “panel” control feel) */}
        <div className="pointer-events-auto absolute left-0 right-0 bottom-0 p-3">
          <div className="flex items-center justify-between rounded-lg bg-black/60 border border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <div className="text-xs text-slate-200">
                <div className="font-bold">{stats.drawCalls.toLocaleString()} draw calls</div>
                <div className="text-[10px] text-slate-400">{stats.triangles.toLocaleString()} tris</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-200">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Clock</div>
                <div className="font-bold">{stats.clock} MHz</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Load</div>
                <div className="font-bold">{stats.gpuLoad}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Temp</div>
                <div className="font-bold">{stats.temp}°C</div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400">
                <Activity size={14} />
                <span className="text-[10px] uppercase tracking-widest">{getStageLabel().sub}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationGPU;