import React, { useState, useRef, useEffect } from 'react';
import { ProcessorType } from '../types';
import { Rotate3d, ZoomIn } from 'lucide-react';

interface Props {
  type: ProcessorType;
}

// Enhanced Layer with 3D Thickness (Cuboid)
const Layer = ({ w, h, z, thickness = 2, color, children, className, style }: any) => {
  // Generate darker shades for sides
  const sideFilter = 'brightness(0.75)';
  const endFilter = 'brightness(0.6)';

  return (
    <div 
      className="absolute top-1/2 left-1/2"
      style={{
        width: w,
        height: h,
        transformStyle: 'preserve-3d',
        transform: `translate3d(-50%, -50%, ${z}px)`,
      }}
    >
      {/* Top Face */}
      <div 
        className={`absolute inset-0 flex items-center justify-center border border-white/10 ${className}`}
        style={{
          backgroundColor: color,
          transform: `translateZ(${thickness}px)`,
          ...style
        }}
      >
        {children}
      </div>

      {/* Bottom Face */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          filter: 'brightness(0.5)',
          transform: 'rotateY(180deg)',
        }}
      />

      {/* Front Side (South) */}
      <div 
        className="absolute bottom-0 left-0 w-full origin-bottom"
        style={{
          height: thickness,
          backgroundColor: color,
          filter: sideFilter,
          transform: 'rotateX(-90deg)',
        }}
      />

      {/* Back Side (North) */}
      <div 
        className="absolute top-0 left-0 w-full origin-top"
        style={{
          height: thickness,
          backgroundColor: color,
          filter: sideFilter,
          transform: 'rotateX(90deg)',
        }}
      />

      {/* Left Side (West) */}
      <div 
        className="absolute top-0 left-0 h-full origin-left"
        style={{
          width: thickness,
          backgroundColor: color,
          filter: endFilter,
          transform: 'rotateY(-90deg)',
        }}
      />

      {/* Right Side (East) */}
      <div 
        className="absolute top-0 right-0 h-full origin-right"
        style={{
          width: thickness,
          backgroundColor: color,
          filter: endFilter,
          transform: 'rotateY(90deg)',
        }}
      />
    </div>
  );
};

const ExplodedProcessor: React.FC<Props> = ({ type }) => {
  const [explodeFactor, setExplodeFactor] = useState(0.5); // 0 to 1
  const [rotation, setRotation] = useState({ x: 55, y: 0, z: 45 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    setRotation(prev => ({ 
      x: Math.max(10, Math.min(90, prev.x - deltaY * 0.5)), 
      y: 0, 
      z: prev.z + deltaX * 0.5 
    }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // -- RENDERERS --

  const renderRyzen9000 = () => {
    const gap = explodeFactor * 60;
    
    // Thickness Defs
    const t_pins = 2;
    const t_sub = 4;
    const t_die = 2;
    const t_ihs = 8;

    // Stack Heights
    const z_pins = 0;
    const z_sub = z_pins + t_pins + (gap * 0.2); // Small initial gap
    const z_die = z_sub + t_sub + (gap * 0.8);
    const z_ihs = z_die + t_die + (gap * 1.5);

    // Helper to render a Core Complex Die (CCD)
    const renderCCD = (xOffset: number, yOffset: number, label: string) => (
      <Layer w={44} h={32} z={z_die} thickness={t_die} style={{transform: `translate3d(${xOffset}px, ${yOffset}px, ${z_die}px)`}} color="#1e293b" className="border-slate-500 shadow-md">
        {/* Silicon Floorplan Visualization */}
        <div className="w-full h-full p-[2px] flex flex-col gap-[1px]">
          {/* Top Row Cores */}
          <div className="flex-1 flex gap-[1px]">
             {[...Array(4)].map((_, i) => (
               <div key={`t${i}`} className="flex-1 bg-amber-600/30 border border-amber-500/50 flex items-center justify-center relative group">
                 <div className="w-[2px] h-[2px] bg-amber-400 rounded-full animate-pulse"></div>
               </div>
             ))}
          </div>
          {/* L3 Cache Strip */}
          <div className="h-[6px] bg-blue-600/30 border border-blue-500/50 flex items-center justify-center">
             <span className="text-[3px] text-blue-200 font-mono tracking-widest">L3 CACHE</span>
          </div>
          {/* Bottom Row Cores */}
          <div className="flex-1 flex gap-[1px]">
             {[...Array(4)].map((_, i) => (
               <div key={`b${i}`} className="flex-1 bg-amber-600/30 border border-amber-500/50 flex items-center justify-center relative group">
                 <div className="w-[2px] h-[2px] bg-amber-400 rounded-full animate-pulse delay-75"></div>
               </div>
             ))}
          </div>
        </div>
        {/* Label Overlay */}
        <span className="absolute -top-4 left-0 text-[6px] text-slate-400 font-mono bg-white/90 px-1 rounded-sm border border-slate-200">{label} (8 Cores)</span>
      </Layer>
    );

    return (
      <div className="object-3d relative w-64 h-64">
         {/* Layer 1: PINS */}
         <Layer w={200} h={200} z={z_pins} thickness={t_pins} color="#d4b483" className="border-yellow-600/50">
            <div className="w-full h-full grid grid-cols-12 gap-px opacity-40">
               {Array(144).fill(0).map((_, i) => <div key={i} className="bg-yellow-900 rounded-full scale-50"></div>)}
            </div>
         </Layer>

         {/* Layer 2: SUBSTRATE */}
         <Layer w={200} h={200} z={z_sub} thickness={t_sub} color="#065f46" className="border-green-800/50 shadow-lg">
             <div className="absolute inset-2 border border-green-500/30"></div>
             {/* Traces */}
             <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay" viewBox="0 0 100 100">
               <path d="M 10 10 L 40 40 L 60 40 L 90 10" stroke="#86efac" strokeWidth="0.5" fill="none" />
               <path d="M 10 90 L 40 60 L 60 60 L 90 90" stroke="#86efac" strokeWidth="0.5" fill="none" />
               <rect x="30" y="30" width="40" height="40" stroke="#86efac" strokeWidth="0.2" fill="none" />
             </svg>
         </Layer>

         {/* Layer 3: DIES */}
         {/* I/O Die */}
         <Layer w={90} h={50} z={z_die} thickness={t_die} color="#334155" className="border-slate-600 shadow-md">
            <div className="w-full h-full border border-slate-500/30 p-1 flex items-center justify-center">
              <span className="text-[6px] text-slate-300 font-mono font-bold tracking-wider">I/O & MEMORY CONTROLLER</span>
            </div>
         </Layer>
         
         {/* CCD 0 */}
         {renderCCD(-55, -35, 'CCD 0')}
         
         {/* CCD 1 */}
         {renderCCD(-55, 35, 'CCD 1')}

         {/* Layer 4: IHS */}
         <Layer w={190} h={190} z={z_ihs} thickness={t_ihs} color="#94a3b8" 
           style={{
             clipPath: 'polygon(15% 0, 85% 0, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0 85%, 0 15%, 25% 25%, 75% 25%, 75% 75%, 25% 75%) fill-rule: evenodd' 
           }}
           className="border-slate-400"
         >
           <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center">
              <div className="text-center opacity-40">
                <div className="font-mono font-bold text-slate-800 text-xl tracking-wider">RYZEN</div>
              </div>
           </div>
         </Layer>
      </div>
    );
  };

  const renderRTX5090 = () => {
    const gap = explodeFactor * 70;
    
    const t_pcb = 4;
    const t_die = 2;
    const t_cold = 12;

    const z_pcb = 0;
    const z_die = z_pcb + t_pcb + (gap * 0.5);
    const z_cold = z_die + t_die + (gap * 1.5);

    return (
      <div className="object-3d relative w-64 h-64">
         {/* Layer 1: PCB */}
         <Layer w={240} h={240} z={z_pcb} thickness={t_pcb} color="#0f172a" className="border-slate-700">
             {/* VRM Simulation */}
             <div className="absolute left-2 top-2 bottom-2 w-10 flex flex-col gap-1 opacity-50">
                {Array(12).fill(0).map((_, i) => <div key={i} className="flex-1 bg-slate-500 border border-slate-600 rounded-sm mx-1"></div>)}
             </div>
             <div className="absolute right-2 top-2 bottom-2 w-10 flex flex-col gap-1 opacity-50">
                {Array(12).fill(0).map((_, i) => <div key={i} className="flex-1 bg-slate-500 border border-slate-600 rounded-sm mx-1"></div>)}
             </div>
         </Layer>

         {/* Layer 2: Main GPU Die (Blackwell) */}
         <Layer w={110} h={110} z={z_die} thickness={t_die} color="#10b981" className="border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
             <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-[1px] p-[1px] opacity-60">
                {Array(64).fill(0).map((_, i) => <div key={i} className="bg-emerald-900/50"></div>)}
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center bg-emerald-900/80 px-2 py-1 backdrop-blur-sm border border-emerald-500/30">
                 <div className="text-[12px] text-white font-mono font-bold tracking-widest">GB202</div>
                 <div className="text-[5px] text-emerald-300">24,576 CORES</div>
               </div>
             </div>
         </Layer>

         {/* Layer 3: GDDR7 Modules (Surrounding Die) - Same Z as die */}
         {/* Top Row */}
         {[0,1,2,3].map(i => (
           <Layer key={`t${i}`} w={26} h={14} z={z_die} thickness={t_die} style={{transform: `translate3d(${(i*28)-42}px, -70px, ${z_die}px)`}} color="#171717" className="border-slate-700">
              <span className="text-[3px] text-slate-500">GDDR7</span>
           </Layer>
         ))}
         {/* Bottom Row */}
         {[0,1,2,3].map(i => (
           <Layer key={`b${i}`} w={26} h={14} z={z_die} thickness={t_die} style={{transform: `translate3d(${(i*28)-42}px, 70px, ${z_die}px)`}} color="#171717" className="border-slate-700" />
         ))}
         {/* Left Col */}
         {[0,1,2,3].map(i => (
           <Layer key={`l${i}`} w={14} h={26} z={z_die} thickness={t_die} style={{transform: `translate3d(-70px, ${(i*28)-42}px, ${z_die}px)`}} color="#171717" className="border-slate-700" />
         ))}
          {/* Right Col */}
          {[0,1,2,3].map(i => (
           <Layer key={`r${i}`} w={14} h={26} z={z_die} thickness={t_die} style={{transform: `translate3d(70px, ${(i*28)-42}px, ${z_die}px)`}} color="#171717" className="border-slate-700" />
         ))}

         {/* Layer 4: Vapor Chamber */}
         <Layer w={180} h={180} z={z_cold} thickness={t_cold} color="#e2e8f0" className="border-slate-300 opacity-90">
             <div className="w-full h-full border-[8px] border-orange-200 bg-gradient-to-tr from-slate-100 to-white relative">
                <span className="absolute bottom-2 right-2 text-[6px] text-slate-400 font-bold tracking-widest">VAPOR CHAMBER</span>
                <div className="absolute inset-0 bg-[radial-gradient(circle,#94a3b8_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
             </div>
         </Layer>
      </div>
    );
  };

  const renderTPUv5 = () => {
    const gap = explodeFactor * 70;
    
    const t_sub = 4;
    const t_int = 2;
    const t_die = 3;
    const t_lid = 6;

    const z_sub = 0;
    const z_int = z_sub + t_sub + (gap * 0.5);
    const z_die = z_int + t_int + (gap * 0.5);
    const z_lid = z_die + t_die + (gap * 2);

    return (
      <div className="object-3d relative w-64 h-64">
        {/* Layer 1: Substrate */}
        <Layer w={220} h={220} z={z_sub} thickness={t_sub} color="#e2e8f0" className="border-slate-300" />
        
        {/* Layer 2: Interposer */}
        <Layer w={160} h={160} z={z_int} thickness={t_int} color="#64748b" className="border-slate-500 shadow-md">
            <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </Layer>

        {/* Layer 3: Logic Die */}
        <Layer w={70} h={70} z={z_die} thickness={t_die} color="#ef4444" className="border-red-600 bg-gradient-to-br from-red-600 to-red-800 shadow-xl">
           <span className="text-white font-bold font-mono text-sm">v5p</span>
        </Layer>

        {/* Layer 4: HBM3 Stacks */}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y], i) => (
           <Layer key={i} w={36} h={36} z={z_die} thickness={t_die + 2} style={{transform: `translate3d(${x*55}px, ${y*55}px, ${z_die}px)`}} color="#1e293b" className="border-slate-600 shadow-xl flex items-center justify-center">
              <span className="text-[6px] text-slate-300 font-bold">HBM3e</span>
           </Layer>
        ))}

        {/* Layer 5: Lid */}
        <Layer w={180} h={180} z={z_lid} thickness={t_lid} color="#cbd5e1" className="border-slate-400 opacity-80">
           <div className="w-full h-full grid grid-cols-4 gap-1 p-2">
             {Array(16).fill(0).map((_, i) => <div key={i} className="bg-slate-400/30 rounded-sm border border-slate-400/20"></div>)}
           </div>
        </Layer>
      </div>
    );
  }

  const renderNPU = () => {
    const gap = explodeFactor * 50;
    
    // Thickness
    const t_sub = 3;
    const t_die = 2;
    const t_mem = 3;

    // Heights
    const z_sub = 0;
    const z_die = z_sub + t_sub + (gap * 0.5);
    // Unified memory usually sits on substrate or is POP. Representing side-by-side on substrate here.
    
    return (
      <div className="object-3d relative w-64 h-64">
        {/* Layer 1: Mobile Substrate (Compact) */}
        <Layer w={180} h={140} z={z_sub} thickness={t_sub} color="#334155" className="border-slate-600 rounded-sm">
           <div className="absolute bottom-2 right-2 text-[5px] text-slate-400 font-mono">FCBGA-1240</div>
        </Layer>

        {/* Layer 2: SoC Die (The "System") */}
        <Layer w={80} h={80} z={z_die} thickness={t_die} color="#1e293b" style={{transform: `translate3d(-30px, 0, ${z_die}px)`}} className="border-slate-500 shadow-xl">
           {/* Floorplan */}
           <div className="w-full h-full p-1 grid grid-cols-2 grid-rows-2 gap-1">
              {/* CPU Area (Dim) */}
              <div className="bg-slate-700/30 border border-slate-600/30 flex items-center justify-center">
                 <span className="text-[4px] text-slate-600">CPU</span>
              </div>
              {/* GPU Area (Dim) */}
              <div className="bg-slate-700/30 border border-slate-600/30 flex items-center justify-center">
                 <span className="text-[4px] text-slate-600">GPU</span>
              </div>
              
              {/* NPU Area (Bright/Hero) - Spans bottom */}
              <div className="col-span-2 bg-violet-600/20 border border-violet-500 flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-500/40 to-transparent animate-pulse"></div>
                 <span className="text-[5px] text-violet-200 font-bold z-10">NEURAL ENGINE</span>
                 <div className="grid grid-cols-8 gap-[1px] mt-1 z-10">
                    {Array(16).fill(0).map((_,i) => <div key={i} className="w-1 h-1 bg-violet-400 rounded-full"></div>)}
                 </div>
              </div>
           </div>
        </Layer>

        {/* Layer 3: Unified Memory (LPDDR5X) - Side by Side */}
        <Layer w={40} h={70} z={z_die} thickness={t_mem} style={{transform: `translate3d(40px, 0, ${z_die}px)`}} color="#0f172a" className="border-slate-700 flex items-center justify-center">
           <div className="text-center">
             <div className="text-[4px] text-slate-400 font-bold">LPDDR5X</div>
             <div className="text-[3px] text-slate-500">UNIFIED</div>
           </div>
        </Layer>
        
        {/* Heat Spreader (Mobile - thin foil style or small lid) */}
         <Layer w={160} h={120} z={z_die + gap + 10} thickness={1} color="#94a3b8" className="opacity-40 border-slate-300">
             <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px] text-slate-800 font-mono rotate-180">MOBILE SoC</span>
             </div>
         </Layer>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-[600px] bg-slate-50 rounded-xl blueprint-border shadow-sm overflow-hidden relative flex flex-col cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-6 left-6 z-10 pointer-events-none select-none">
         <h3 className="font-mono font-bold text-slate-900 text-lg uppercase tracking-wider border-b-2 border-slate-900 inline-block mb-1">Schematic View</h3>
         <p className="text-xs text-slate-500 font-mono">Interactive Exploded Diagram</p>
      </div>

      <div 
        className="absolute bottom-6 left-6 z-10 w-72 p-6 bg-white/90 backdrop-blur border border-slate-200 rounded-lg shadow-xl"
        onMouseDown={(e) => e.stopPropagation()} 
      >
         <div className="flex justify-between text-xs font-mono font-bold text-slate-600 mb-3">
           <span>ASSEMBLED</span>
           <span>EXPLODED</span>
         </div>
         <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={explodeFactor}
            onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
         />
      </div>
      
      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs border border-slate-200 p-2 rounded bg-white/80">
           <Rotate3d size={14} />
           <span>DRAG TO ROTATE</span>
        </div>
      </div>

      <div className="scene-3d w-full h-full flex items-center justify-center bg-grid">
        <div 
          className="object-3d relative transition-transform duration-75 ease-linear"
          style={{ transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.z}deg) rotateY(${rotation.y}deg)` }}
        >
          {type === ProcessorType.CPU && renderRyzen9000()}
          {type === ProcessorType.GPU && renderRTX5090()}
          {type === ProcessorType.TPU && renderTPUv5()}
          {type === ProcessorType.NPU && renderNPU()}
        </div>
      </div>
    </div>
  );
};

export default ExplodedProcessor;