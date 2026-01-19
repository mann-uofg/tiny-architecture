import React, { useState, useEffect } from 'react';
import { Play, Grid, Pause, AlignJustify } from 'lucide-react';

const VisualizerGPU: React.FC = () => {
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWarp, setActiveWarp] = useState(0);

  // Simulation of 4 Warps (threads groups)
  // Each warp has a state: READY, EXEC, STALL (Memory), DONE
  const [warps, setWarps] = useState([
    { id: 0, state: 'READY', pc: 0, color: 'bg-emerald-500' },
    { id: 1, state: 'READY', pc: 0, color: 'bg-blue-500' },
    { id: 2, state: 'READY', pc: 0, color: 'bg-purple-500' },
    { id: 3, state: 'READY', pc: 0, color: 'bg-orange-500' },
  ]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setClock(c => c + 1);
        
        // Simple Warp Scheduler Logic
        // Round Robin: Pick next READY warp
        setWarps(prev => {
          const next = [...prev];
          
          // Current active warp moves forward
          const current = next[activeWarp];
          
          if (current.state === 'EXEC') {
            // Simulated instruction completion
            if (Math.random() > 0.7) {
               current.state = 'STALL'; // Hit memory latency
            } else {
               current.state = 'READY';
               current.pc += 1;
            }
          } else if (current.state === 'STALL') {
             // Simulate memory return
             if (Math.random() > 0.5) current.state = 'READY';
          }

          // Scheduler picks next warp for execution
          let nextWarpIdx = (activeWarp + 1) % 4;
          // Find first READY warp
          for(let i=0; i<4; i++) {
             if (next[nextWarpIdx].state === 'READY') {
                break;
             }
             nextWarpIdx = (nextWarpIdx + 1) % 4;
          }
          
          // Dispatch
          if (next[nextWarpIdx].state === 'READY') {
             next[nextWarpIdx].state = 'EXEC';
             setActiveWarp(nextWarpIdx);
          }

          return next;
        });

      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeWarp]);

  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col">
       <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-200">
        <div>
           <h3 className="font-mono font-black text-slate-900 text-2xl uppercase flex items-center gap-3">
             <Grid className="text-slate-900" size={28}/> SM Architecture (Ampere-like)
           </h3>
           <div className="text-sm font-mono text-slate-500 mt-2">
             GLOBAL CLOCK: <span className="text-slate-900 font-bold">{clock}</span> | SCHEDULER: <span className="text-emerald-600 font-bold">WARP {activeWarp}</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setClock(0); setWarps(w => w.map(x => ({...x, state: 'READY', pc: 0}))); }} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-md font-bold text-sm font-mono transition-colors">FLUSH_PIPE</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-sm flex items-center gap-3 font-mono transition-colors">
            {isPlaying ? <><Pause size={16}/> FREEZE</> : <><Play size={16}/> COMPUTE</>}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 relative">
         
         {/* Left: Warp Scheduler & Register File */}
         <div className="col-span-4 flex flex-col gap-6 z-10">
            <div className="border-2 border-slate-800 bg-white p-5 shadow-sm">
               <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <AlignJustify size={14} /> WARP SCHEDULER
               </div>
               <div className="space-y-3">
                  {warps.map((warp) => (
                     <div key={warp.id} className={`flex items-center justify-between p-3 border rounded-sm ${warp.id === activeWarp ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${warp.color}`}></div>
                           <span className="font-mono text-sm font-bold">Warp {warp.id}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                           warp.state === 'EXEC' ? 'bg-emerald-100 text-emerald-700' :
                           warp.state === 'STALL' ? 'bg-rose-100 text-rose-700' :
                           'bg-slate-100 text-slate-500'
                        }`}>
                           {warp.state}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="border-2 border-slate-400 bg-slate-100 flex-1 p-5 shadow-inner">
               <div className="text-xs font-bold text-slate-500 text-center mb-3">REGISTER FILE (128KB)</div>
               <div className="grid grid-cols-8 gap-1.5 h-full content-start">
                  {Array(64).fill(0).map((_, i) => (
                     <div key={i} className={`h-2 w-full rounded-sm ${i % 7 === activeWarp ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  ))}
               </div>
            </div>
         </div>

         {/* Center: CUDA Cores (Execution Units) */}
         <div className="col-span-6 flex flex-col z-10">
            <div className="bg-slate-800 text-white text-xs font-bold text-center py-2 rounded-t-md uppercase tracking-widest">DATAPATH: SP / INT32 UNITS</div>
            <div className="border-x-2 border-b-2 border-slate-800 bg-white p-6 grid grid-cols-4 gap-3 flex-1 relative shadow-lg">
               
               {/* Overlay Arrow for Dispatch */}
               {isPlaying && (
                  <div className="absolute -left-8 top-12 animate-pulse text-emerald-600 drop-shadow-lg">
                     <Play size={32} fill="currentColor" />
                  </div>
               )}

               {Array(16).fill(0).map((_, i) => (
                  <div key={i} className={`
                     border-2 flex flex-col items-center justify-center p-2 transition-all duration-200 min-h-[60px] rounded-sm
                     ${isPlaying && warps[activeWarp].state === 'EXEC' ? 'bg-emerald-50 border-emerald-400 shadow-md scale-105' : 'bg-slate-50 border-slate-200'}
                  `}>
                     <div className="text-[10px] font-mono text-slate-400 mb-1">Core {i}</div>
                     <div className={`text-sm font-black tracking-tighter ${isPlaying && warps[activeWarp].state === 'EXEC' ? 'text-emerald-600' : 'text-slate-300'}`}>
                        ALU
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Right: Memory Hierarchy */}
         <div className="col-span-2 flex flex-col gap-4 z-10 font-mono">
             <div className="border-2 border-slate-300 bg-orange-50 p-4 flex-1 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="text-xs font-bold text-orange-800 mb-2">L1 / SHARED</div>
                <div className="text-[10px] text-orange-600">20 cycles</div>
             </div>
             <div className="border-2 border-slate-300 bg-blue-50 p-4 flex-1 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="text-xs font-bold text-blue-800 mb-2">L2 CACHE</div>
                <div className="text-[10px] text-blue-600">100 cycles</div>
             </div>
             <div className="border-2 border-slate-300 bg-slate-200 p-4 flex-1 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="text-xs font-bold text-slate-600 mb-2">VRAM (GDDR7)</div>
                <div className="text-[10px] text-slate-500">400 cycles</div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default VisualizerGPU;
