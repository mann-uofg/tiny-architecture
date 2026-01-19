import React, { useState } from 'react';
import { Cpu, Grid, Layers, Zap, Settings, Activity, Box, MonitorPlay, Component } from 'lucide-react';
import { ProcessorType } from './types';
import { PROCESSORS } from './constants';
import VisualizerCPU from './components/VisualizerCPU';
import VisualizerGPU from './components/VisualizerGPU';
import VisualizerTPU from './components/VisualizerTPU';
import VisualizerNPU from './components/VisualizerNPU';
import ApplicationCPU from './components/ApplicationCPU';
import ApplicationGPU from './components/ApplicationGPU';
import ApplicationTPU from './components/ApplicationTPU';
import ApplicationNPU from './components/ApplicationNPU';
import ExplodedProcessor from './components/ExplodedProcessor';
import ComparisonView from './components/ComparisonView';
import ManufacturingView from './components/ManufacturingView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProcessorType>(ProcessorType.CPU);
  const [viewMode, setViewMode] = useState<'ARCH' | 'APP'>('ARCH');
  
  const currentInfo = PROCESSORS[activeTab];

  const renderVisualizer = () => {
    if (viewMode === 'ARCH') {
      switch (activeTab) {
        case ProcessorType.CPU: return <VisualizerCPU />;
        case ProcessorType.GPU: return <VisualizerGPU />;
        case ProcessorType.TPU: return <VisualizerTPU />;
        case ProcessorType.NPU: return <VisualizerNPU />;
        default: return <VisualizerCPU />;
      }
    } else {
      switch (activeTab) {
        case ProcessorType.CPU: return <ApplicationCPU />;
        case ProcessorType.GPU: return <ApplicationGPU />;
        case ProcessorType.TPU: return <ApplicationTPU />;
        case ProcessorType.NPU: return <ApplicationNPU />;
        default: return <ApplicationCPU />;
      }
    }
  };

  const getIcon = (type: ProcessorType) => {
    switch(type) {
      case ProcessorType.CPU: return <Cpu size={18} />;
      case ProcessorType.GPU: return <Grid size={18} />;
      case ProcessorType.TPU: return <Layers size={18} />;
      case ProcessorType.NPU: return <Zap size={18} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-20 selection:bg-slate-900 selection:text-white relative overflow-x-hidden">
      
      {/* BACKGROUND CANVAS LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base tint */}
        <div className="absolute inset-0 bg-[#f8fafc]"></div>
        
        {/* Major Technical Grid (60px) */}
        <div 
          className="absolute inset-0 opacity-[0.6]" 
          style={{ 
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(to right, #cbd5e1 1px, transparent 1px)', 
            backgroundSize: '60px 60px' 
          }}
        ></div>
        
        {/* Minor Technical Grid (20px) - Adds Graph Paper Feel */}
        <div 
          className="absolute inset-0 opacity-[0.3]" 
          style={{ 
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        ></div>

        {/* Ambient Vignette for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(255,255,255,0.8)_80%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(248,250,252,1)_100%)]"></div>
      </div>

      {/* FLOATING GLASS DOCK NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-black/90 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-2xl flex gap-1 relative ring-1 ring-black/5">
              {Object.values(PROCESSORS).map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => setActiveTab(proc.id)}
                  className={`
                    relative px-6 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all duration-300
                    ${activeTab === proc.id 
                      ? 'bg-white text-black shadow-lg scale-100' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'}
                  `}
                >
                  <span className={`transition-colors duration-300 ${activeTab === proc.id ? 'text-black' : 'text-slate-500 group-hover:text-white'}`}>
                    {getIcon(proc.id)}
                  </span>
                  <span>{proc.id}</span>
                </button>
              ))}
           </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 space-y-24">
        
        {/* HERO: Blueprint Style */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
           <div className="space-y-8 pt-4">
              <div className="relative">
                {/* Decorative Line */}
                <div className="absolute -left-6 top-2 bottom-2 w-1 bg-slate-900/10"></div>
                
                <div className="font-mono text-xs text-slate-500 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-900 rounded-full"></span>
                  TECHNICAL SPECIFICATION
                </div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 drop-shadow-sm">{currentInfo.name}</h1>
                <div className="inline-block bg-slate-900 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-widest mb-6 shadow-md rounded-sm">
                  {currentInfo.tagline}
                </div>
                
                <p className="text-lg text-slate-700 leading-relaxed font-medium max-w-xl">
                  {currentInfo.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 shadow-sm">
                 {Object.entries(currentInfo.architectureStats).map(([key, value]) => (
                   <div key={key} className="bg-white/80 backdrop-blur-sm p-4 group hover:bg-white transition-colors">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-2">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-sm group-hover:text-blue-600">{value}</div>
                   </div>
                 ))}
              </div>
           </div>

           {/* 3D Model */}
           <div className="relative group">
              <div className="absolute -inset-4 bg-white/40 backdrop-blur-sm rounded-xl -z-10 border border-white/50 shadow-sm"></div>
              <div className="absolute top-0 right-0 font-mono text-[10px] text-slate-400 font-bold bg-white/90 px-2 py-1 z-10 border border-slate-100 shadow-sm">FIG 1.0</div>
              <ExplodedProcessor type={activeTab} />
           </div>
        </section>

        {/* LOGIC SECTION WITH TOGGLE */}
        <section className="relative">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
             <div className="flex items-center gap-4">
               <div className="bg-slate-900 text-white p-2 shadow-lg rounded-sm">
                 <Settings size={24} />
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
                    Operational Logic
                  </h2>
                  <div className="text-xs text-slate-500 font-mono mt-1">
                    INTERACTIVE SIMULATION MODULE
                  </div>
               </div>
             </div>

             {/* TOGGLE SWITCH */}
             <div className="bg-slate-200 p-1 rounded-full flex gap-1 border border-slate-300 shadow-inner">
                <button 
                  onClick={() => setViewMode('ARCH')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-mono transition-all duration-300 ${viewMode === 'ARCH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <Component size={14} /> MICRO-ARCHITECTURE
                </button>
                <button 
                  onClick={() => setViewMode('APP')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold font-mono transition-all duration-300 ${viewMode === 'APP' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                   <MonitorPlay size={14} /> REAL-WORLD USAGE
                </button>
             </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Increased Height for better visibility */}
              <div className="lg:col-span-2 h-[700px] shadow-2xl rounded-sm overflow-hidden border border-slate-200 bg-white">
                 {renderVisualizer()}
              </div>
              <div className="lg:col-span-1 border border-slate-200 p-8 flex flex-col justify-center bg-white/80 backdrop-blur shadow-lg rounded-sm">
                 <h3 className="font-mono text-sm font-bold text-slate-900 uppercase mb-4 border-b border-slate-300 pb-2">Workload Optimization</h3>
                 {/* Increased text size and line height */}
                 <p className="text-base text-slate-700 leading-8 mb-8 font-medium">
                   {activeTab === ProcessorType.CPU && "The CPU is optimized for SERIAL execution. It uses massive caches and complex branch prediction to execute one difficult instruction after another with minimal latency."}
                   {activeTab === ProcessorType.GPU && "The GPU is optimized for PARALLEL execution. It creates thousands of threads. If one thread stalls waiting for memory, the GPU simply switches to another thread instantly."}
                   {activeTab === ProcessorType.TPU && "The TPU is optimized for MATRIX MATH training. It reduces memory access by passing data directly between neighbors (systolic array), achieving the highest FLOPS/Watt for AI training."}
                   {activeTab === ProcessorType.NPU && "The NPU specializes in INFERENCE. It relies on Quantization (low precision math like INT8) to execute pre-trained models with extreme energy efficiency, ignoring the high precision needed for training."}
                 </p>
                 
                 <div>
                   <span className="font-mono text-xs font-bold text-slate-400 uppercase">Primary Applications</span>
                   <div className="flex flex-wrap gap-2 mt-4">
                      {currentInfo.bestFor && Object.values(currentInfo.bestFor).map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase shadow-sm tracking-wide">
                          {tag}
                        </span>
                      ))}
                   </div>
                 </div>
              </div>
           </div>
        </section>

        {/* MANUFACTURING */}
        <section>
           <div className="flex items-center gap-4 mb-8">
             <div className="bg-slate-900 text-white p-2 shadow-lg rounded-sm">
               <Box size={24} />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
               Fabrication Process
             </h2>
             <div className="h-px bg-slate-300 flex-1 ml-4"></div>
           </div>
           <div className="shadow-xl rounded-sm overflow-hidden border border-slate-200">
             <ManufacturingView type={activeTab} />
           </div>
        </section>

        {/* COMPARISON */}
        <section>
           <div className="flex items-center gap-4 mb-8">
             <div className="bg-slate-900 text-white p-2 shadow-lg rounded-sm">
               <Activity size={24} />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">
               Technical Benchmarks
             </h2>
             <div className="h-px bg-slate-300 flex-1 ml-4"></div>
           </div>
           <div className="shadow-xl rounded-sm overflow-hidden border border-slate-200">
             <ComparisonView activeType={activeTab} />
           </div>
        </section>

      </main>

      <footer className="relative z-10 mt-24 py-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
          <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
             Interactive Educational Demo • v2.0
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
