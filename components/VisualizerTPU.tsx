import React, { useState, useEffect } from 'react';
import { Play, Pause, Layers, ArrowDown, ArrowRight } from 'lucide-react';

const SIZE = 4; // 4x4 Array

const VisualizerTPU: React.FC = () => {
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavefront, setWavefront] = useState(-1); // Controls the diagonal wave of data

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setClock(c => c + 1);
        setWavefront(w => (w > SIZE * 2 ? 0 : w + 1));
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col">
       <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-200">
        <div>
           <h3 className="font-mono font-black text-slate-900 text-2xl uppercase flex items-center gap-3">
             <Layers className="text-slate-900" size={28}/> Tensor Processing Unit (v5p)
           </h3>
           <div className="text-sm font-mono text-slate-500 mt-2">
             MATRIX CLOCK: <span className="text-rose-600 font-bold">{clock}</span> | OPERATION: <span className="text-slate-900 font-bold">GEMM (MatMul)</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setClock(0); setWavefront(-1); }} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-md font-bold text-sm font-mono transition-colors">CLR_BUFFER</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-sm flex items-center gap-3 font-mono transition-colors">
            {isPlaying ? <><Pause size={16}/> HALT</> : <><Play size={16}/> PULSE</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 font-mono relative">
         {/* Background Connectors */}
         <div className="absolute inset-0 pointer-events-none z-0">
             {/* Simple lines connecting HBM to buffers */}
             <div className="absolute top-12 left-[12%] w-[4px] h-full bg-slate-200"></div>
             <div className="absolute top-[25%] left-0 w-full h-[4px] bg-slate-200"></div>
         </div>

         {/* Left: Weight FIFO / HBM Interface */}
         <div className="w-32 flex flex-col items-center justify-center gap-6 border-r-2 border-slate-200 pr-6 z-10 bg-slate-50">
             <div className="h-40 w-24 bg-slate-800 text-white flex items-center justify-center text-xs font-bold text-center p-2 rounded-md shadow-lg">
                HBM WEIGHT BUFFER
             </div>
             <ArrowDown className="text-slate-400 animate-bounce" size={28} />
             <div className="h-40 w-24 bg-white border-2 border-slate-400 text-slate-600 flex items-center justify-center text-xs font-bold text-center p-2 rounded-md shadow-sm">
                WEIGHT FIFO
             </div>
         </div>

         {/* Center: Systolic Array */}
         <div className="flex-1 flex flex-col items-center justify-center z-10">
             <div className="text-sm font-bold text-slate-500 mb-4 tracking-widest uppercase">MXU (MATRIX MULTIPLY UNIT)</div>
             {/* Increased gap and padding */}
             <div className="grid grid-cols-4 gap-3 p-6 bg-white border-2 border-rose-100 shadow-2xl rounded-md">
                {Array(SIZE).fill(0).map((_, row) => (
                   <React.Fragment key={row}>
                     {Array(SIZE).fill(0).map((_, col) => {
                       // Calculate if this cell is active based on wavefront
                       // In systolic array, data hits cell [r,c] at time T = r + c
                       const isActive = isPlaying && wavefront >= (row + col) && wavefront < (row + col + 2);
                       const isDone = isPlaying && wavefront >= (row + col + 2);
                       
                       return (
                         <div key={`${row}-${col}`} className={`
                            w-20 h-20 flex items-center justify-center border-2 transition-all duration-300 rounded-md relative
                            ${isActive ? 'bg-rose-500 border-rose-600 scale-110 z-20 shadow-xl' : 'bg-slate-50 border-slate-200'}
                         `}>
                            {/* MAC Unit Visualization */}
                            <div className="text-[10px] font-bold text-center leading-tight">
                               <div className={`text-sm mb-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>MAC</div>
                               {isActive && <div className="text-[10px] text-rose-200 font-bold tracking-wide">BUSY</div>}
                               {isDone && <div className="text-[10px] text-slate-400 mt-1">ACC</div>}
                            </div>
                         </div>
                       );
                     })}
                   </React.Fragment>
                ))}
             </div>
             <div className="mt-6 text-xs text-slate-400 flex items-center gap-3">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-500 rounded-sm shadow-sm"></div> <span className="font-bold">ACTIVE COMPUTATION</span>
                 </div>
                 <div className="flex items-center gap-2 ml-4">
                    <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded-sm shadow-sm"></div> <span>IDLE / LOAD</span>
                 </div>
             </div>
         </div>

         {/* Right: Unified Buffer / Accumulators */}
         <div className="w-32 flex flex-col items-center justify-center gap-6 border-l-2 border-slate-200 pl-6 z-10 bg-slate-50">
             <div className="h-full w-24 bg-white border-2 border-blue-200 flex flex-col items-center p-2 rounded-md shadow-sm overflow-hidden">
                <div className="text-xs font-bold text-blue-800 border-b border-blue-100 w-full text-center pb-2 mb-2">UNIFIED BUFFER</div>
                {/* Simulated Data filling up */}
                <div className="flex-1 w-full flex flex-col justify-end gap-1.5">
                   {Array(8).fill(0).map((_, i) => (
                      <div key={i} className={`h-3 w-full bg-blue-500 rounded-sm transition-opacity duration-500 ${clock > i * 2 ? 'opacity-100' : 'opacity-10'}`}></div>
                   ))}
                </div>
             </div>
         </div>

      </div>
    </div>
  );
};

export default VisualizerTPU;
