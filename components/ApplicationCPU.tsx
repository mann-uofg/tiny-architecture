import React, { useState, useEffect } from 'react';
import { LayoutList, Cpu, Activity, Monitor, Gamepad2, Video, MessageSquare, Globe } from 'lucide-react';

const ApplicationCPU: React.FC = () => {
  const [tick, setTick] = useState(0);

  // Define our specific workload scenario
  const [cores, setCores] = useState([
    { id: 0, type: 'P-CORE', task: 'GAME_MAIN_LOOP', util: 98, color: 'bg-rose-500', icon: <Gamepad2 size={14} /> },
    { id: 1, type: 'P-CORE', task: 'GAME_PHYSICS', util: 85, color: 'bg-rose-500', icon: <Activity size={14} /> },
    { id: 2, type: 'E-CORE', task: 'OBS_ENCODER', util: 60, color: 'bg-blue-500', icon: <Video size={14} /> },
    { id: 3, type: 'E-CORE', task: 'IDLE', util: 10, color: 'bg-slate-400', icon: <Monitor size={14} /> },
  ]);

  const [backgroundQueue, setBackgroundQueue] = useState([
    { name: 'Discord', color: 'bg-indigo-500', icon: <MessageSquare size={12} /> },
    { name: 'Chrome_Tab_1', color: 'bg-yellow-500', icon: <Globe size={12} /> },
    { name: 'Chrome_Tab_2', color: 'bg-yellow-500', icon: <Globe size={12} /> },
    { name: 'Windows_Update', color: 'bg-slate-600', icon: <Monitor size={12} /> },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);

      setCores(prevCores => {
        return prevCores.map((core, idx) => {
          // Core 0 (Game Main): Locked, extremely high load, never swaps
          if (idx === 0) {
            return { ...core, util: 95 + Math.random() * 5 };
          }
          
          // Core 1 (Game Physics): High load, rare drops
          if (idx === 1) {
            return { ...core, util: 70 + Math.random() * 20 };
          }

          // Core 2 (Streaming): Bursty load (Keyframe intervals)
          if (idx === 2) {
             const isKeyframe = (tick % 4 === 0);
             return { 
                ...core, 
                util: isKeyframe ? 90 : 30,
                task: isKeyframe ? 'OBS_KEYFRAME_GEN' : 'OBS_WAIT'
             };
          }

          // Core 3 (Background): The "Junk Drawer" Core - Frequent Context Switching
          if (idx === 3) {
             // Simulate context switch every 2 ticks
             if (tick % 2 === 0) {
                // Pick random background task
                const nextTask = backgroundQueue[Math.floor(Math.random() * backgroundQueue.length)];
                return {
                   ...core,
                   task: nextTask.name,
                   color: nextTask.color,
                   util: 40 + Math.random() * 40,
                   icon: nextTask.icon
                };
             }
             return { ...core, util: Math.max(0, core.util - 5) };
          }

          return core;
        });
      });

    }, 800);

    return () => clearInterval(interval);
  }, [tick, backgroundQueue]);

  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Cpu size={300} />
      </div>

      <div className="z-10 mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="bg-orange-600 text-white p-2 rounded-md shadow-sm"><LayoutList size={20} /></div>
           <div>
             <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Real-World Scenario: Gaming + Streaming</h3>
             <div className="text-xs text-slate-500 font-mono">Workload Distribution & Thread Affinity</div>
           </div>
        </div>
        <p className="text-sm text-slate-600 max-w-2xl mt-4 leading-relaxed">
           In a heavy scenario like playing a AAA game while streaming, the CPU acts as the "Conductor". 
           Notice how <strong>Core 0 & 1</strong> are locked to the game (high priority), while <strong>Core 3</strong> rapidly swaps between background apps (Chrome, Discord) to keep them responsive without slowing down the game.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 z-10 items-center">
         
         {/* LEFT: Task Manager View */}
         <div className="bg-white border-2 border-slate-200 rounded-lg shadow-sm p-5 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
               <span className="font-mono text-xs font-bold text-slate-400 uppercase">Active Threads</span>
               <span className="font-mono text-xs font-bold text-emerald-600">TOTAL CPU: 78%</span>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
               {/* Hero Task: Game */}
               <div className="flex items-center gap-3 p-2 bg-rose-50 border border-rose-100 rounded-sm">
                  <div className="p-1 bg-rose-500 text-white rounded"><Gamepad2 size={12}/></div>
                  <div className="flex-1">
                     <div className="font-bold text-slate-800">Cyberpunk.exe</div>
                     <div className="text-[10px] text-slate-500">Threads: 12 | Priority: REALTIME</div>
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-rose-600">45%</div>
                     <div className="text-[10px] text-slate-400">Core 0,1</div>
                  </div>
               </div>

               {/* Secondary Task: OBS */}
               <div className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-100 rounded-sm">
                  <div className="p-1 bg-blue-500 text-white rounded"><Video size={12}/></div>
                  <div className="flex-1">
                     <div className="font-bold text-slate-800">OBS64.exe</div>
                     <div className="text-[10px] text-slate-500">Threads: 4 | Priority: HIGH</div>
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-blue-600">15%</div>
                     <div className="text-[10px] text-slate-400">Core 2</div>
                  </div>
               </div>

               {/* Background Tasks */}
               <div className="mt-4 pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Background Processes (Core 3 Shared)</div>
                  <div className="grid grid-cols-2 gap-2">
                     {backgroundQueue.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 text-slate-600 opacity-70">
                           {t.icon} <span>{t.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT: Physical Core Utilization */}
         <div className="grid grid-cols-1 gap-4">
            {cores.map((core) => (
               <div key={core.id} className="relative">
                  {/* Core Container */}
                  <div className={`
                     border-2 rounded-md p-4 transition-all duration-300 relative overflow-hidden
                     ${core.util > 90 ? 'border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.15)]' : 'border-slate-300'}
                     bg-white
                  `}>
                     {/* Usage Bar Background */}
                     <div 
                        className={`absolute inset-0 opacity-10 transition-all duration-500 ${core.color}`} 
                        style={{ width: `${core.util}%` }}
                     ></div>

                     <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 flex items-center justify-center rounded text-white font-bold shadow-sm ${core.color}`}>
                              {core.icon}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <span className="font-mono text-sm font-black text-slate-800">CORE {core.id}</span>
                                 <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">{core.type}</span>
                              </div>
                              <div className="font-mono text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                 {core.task}
                                 {core.id === 3 && <span className="text-[8px] text-orange-500 font-bold px-1 border border-orange-200 rounded animate-pulse">SWITCHING</span>}
                              </div>
                           </div>
                        </div>

                        <div className="text-right">
                           <div className="font-mono text-xl font-black text-slate-800">{Math.round(core.util)}%</div>
                           <div className="text-[10px] text-slate-400 uppercase tracking-wider">Load</div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Instruction Pipeline Visual (Decor) */}
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-full flex flex-col justify-around opacity-30">
                     <div className={`w-1 h-1 rounded-full ${core.color} animate-ping`} style={{animationDelay: '0s'}}></div>
                     <div className={`w-1 h-1 rounded-full ${core.color} animate-ping`} style={{animationDelay: '0.2s'}}></div>
                     <div className={`w-1 h-1 rounded-full ${core.color} animate-ping`} style={{animationDelay: '0.4s'}}></div>
                  </div>
               </div>
            ))}
         </div>

      </div>
    </div>
  );
};

export default ApplicationCPU;
