import React, { useState, useEffect } from 'react';
import { Play, Pause, Zap, Scan, ArrowRight, FileDigit } from 'lucide-react';

const VisualizerNPU: React.FC = () => {
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stage, setStage] = useState(0); // 0: Input, 1: Quantize, 2: Compute, 3: Activate, 4: Output

  // Simulated Neural Net Pipeline
  const pipeline = [
    { name: "INPUT SENSOR", icon: <Scan size={16} />, data: "FLOAT32" },
    { name: "QUANTIZER", icon: <FileDigit size={16} />, data: "INT8" },
    { name: "NEURAL CORE", icon: <Zap size={16} />, data: "MAC" },
    { name: "ACTIVATION", icon: <ActivityIcon size={16} />, data: "ReLU" },
    { name: "CLASSIFIER", icon: <TagIcon size={16} />, data: "RESULT" }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setClock(c => c + 1);
        setStage(s => (s + 1) % 5);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col relative overflow-hidden">
       {/* Header */}
       <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-200 z-10">
        <div>
           <h3 className="font-mono font-black text-slate-900 text-2xl uppercase flex items-center gap-3">
             <Zap className="text-slate-900" size={28}/> Neural Engine (Inference)
           </h3>
           <div className="text-sm font-mono text-slate-500 mt-2">
             POWER DRAW: <span className="text-emerald-600 font-bold">LOW (5W)</span> | PRECISION: <span className="text-violet-600 font-bold">INT8 (Quantized)</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setClock(0); setStage(0); }} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-md font-bold text-sm font-mono transition-colors">RESET_NET</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-sm flex items-center gap-3 font-mono transition-colors">
            {isPlaying ? <><Pause size={16}/> PAUSE</> : <><Play size={16}/> INFERENCE</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8 relative z-10">
          
          {/* Main Pipeline Visualization */}
          <div className="flex justify-between items-center px-4">
             {pipeline.map((step, idx) => {
               const isActive = isPlaying && stage === idx;
               const isPast = isPlaying && stage > idx;

               return (
                 <React.Fragment key={idx}>
                   {/* Node */}
                   <div className={`relative flex flex-col items-center gap-3 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-70'}`}>
                      <div className={`
                        w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg transition-colors duration-300
                        ${isActive ? 'bg-violet-600 border-violet-800 text-white shadow-violet-200' : 'bg-white border-slate-300 text-slate-500'}
                      `}>
                         <div className="mb-2">{step.icon}</div>
                         <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-center px-1">{step.name}</div>
                         {isActive && (
                            <div className="mt-1 px-2 py-0.5 bg-white/20 rounded text-[9px] font-mono font-bold animate-pulse">
                               PROCESSING
                            </div>
                         )}
                      </div>
                      
                      {/* Data Value Simulation */}
                      <div className={`font-mono text-xs font-bold transition-all ${isActive ? 'text-violet-700 translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                         {idx === 0 && "0.89342"}
                         {idx === 1 && "114 (0x72)"}
                         {idx === 2 && "ACC: 4096"}
                         {idx === 3 && "MAX(0, x)"}
                         {idx === 4 && "Face ID: OK"}
                      </div>
                   </div>

                   {/* Connector Arrow */}
                   {idx < pipeline.length - 1 && (
                     <div className="flex-1 h-1 bg-slate-200 mx-4 relative overflow-hidden rounded-full">
                        <div className={`absolute inset-0 bg-violet-400 transition-transform duration-1000 ease-linear ${stage === idx && isPlaying ? 'translate-x-0' : '-translate-x-full'}`}></div>
                     </div>
                   )}
                 </React.Fragment>
               )
             })}
          </div>

          {/* Explainer Box */}
          <div className="mt-12 grid grid-cols-2 gap-8">
             <div className="bg-violet-50 border border-violet-200 p-6 rounded-md">
                <h4 className="font-mono text-sm font-bold text-violet-900 mb-2 uppercase flex items-center gap-2">
                   <FileDigit size={16} /> What is Quantization?
                </h4>
                <p className="text-xs text-violet-800 leading-relaxed">
                   Conventional CPUs/GPUs use 32-bit floating point numbers (e.g., 0.1234567). 
                   NPUs compress this to tiny 8-bit integers (e.g., 12). This reduces memory usage by 4x and energy consumption by up to 10x, with minimal accuracy loss.
                </p>
             </div>
             
             <div className="bg-slate-100 border border-slate-200 p-6 rounded-md flex items-center justify-around">
                 <div className="text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1">~0.1ms</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Latency</div>
                 </div>
                 <div className="w-px h-10 bg-slate-300"></div>
                 <div className="text-center">
                    <div className="text-2xl font-black text-emerald-600 mb-1">5 TOPS/W</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Efficiency</div>
                 </div>
                 <div className="w-px h-10 bg-slate-300"></div>
                 <div className="text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1">98%</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Sparsity</div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

// Simple icon helpers
const ActivityIcon = ({size}: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const TagIcon = ({size}: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

export default VisualizerNPU;
