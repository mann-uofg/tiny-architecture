import React, { useState, useEffect } from 'react';
import { Camera, ScanFace, Battery } from 'lucide-react';

const ApplicationNPU: React.FC = () => {
  const [scanning, setScanning] = useState(true);
  
  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col relative">
      <div className="z-10 mb-6">
        <div className="flex items-center gap-3 mb-2">
           <div className="bg-violet-600 text-white p-2 rounded-md"><ScanFace size={20} /></div>
           <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">On-Device Computer Vision</h3>
        </div>
        <p className="text-sm text-slate-600 max-w-2xl">
          Your phone uses an NPU to analyze camera frames in real-time for FaceID or object detection. It does this efficiently without draining your battery, unlike a GPU.
        </p>
      </div>

      <div className="flex-1 flex gap-12 z-10 items-center justify-center">
         
         {/* Phone/Camera Viewfinder */}
         <div className="relative w-[300px] h-[500px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-20"></div>

            {/* Simulated Camera Feed (Static Image) */}
            <div className="absolute inset-0 bg-slate-200">
               {/* Simple SVG Portrait */}
               <svg viewBox="0 0 200 300" className="w-full h-full opacity-50">
                  <circle cx="100" cy="100" r="40" fill="#94a3b8" />
                  <path d="M60,180 Q100,240 140,180 L140,300 L60,300 Z" fill="#94a3b8" />
               </svg>
            </div>

            {/* Scanning Overlay */}
            <div className="absolute inset-0 z-10">
               {/* Scanning Line */}
               <div className="w-full h-1 bg-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-scan"></div>
               
               {/* Bounding Box (Appears) */}
               <div className="absolute top-[60px] left-[50px] w-[100px] h-[100px] border-2 border-violet-500 rounded-lg animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-end">
                   <div className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 mb-[-10px] ml-2 rounded-sm shadow-sm">
                      FACE 99.8%
                   </div>
               </div>
            </div>

            {/* Camera UI */}
            <div className="absolute bottom-8 left-0 w-full flex justify-center gap-8 text-white z-20">
               <div className="w-12 h-12 rounded-full border-4 border-white"></div>
            </div>
         </div>

         {/* Stats Panel */}
         <div className="flex flex-col gap-6 w-64">
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase">
                   <Battery size={16} /> Power Consumption
                </div>
                <div className="flex items-end gap-2">
                   <div className="text-2xl font-black text-violet-600">250mW</div>
                   <div className="text-xs text-slate-400 mb-1">Peak</div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-violet-500 w-[10%]"></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                   *GPU would use ~5000mW for same task
                </div>
             </div>

             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase">
                   <Camera size={16} /> Inference Speed
                </div>
                <div className="flex items-end gap-2">
                   <div className="text-2xl font-black text-slate-900">60 FPS</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                   Real-time latency: 16ms
                </div>
             </div>
         </div>

      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
          position: absolute;
        }
      `}</style>
    </div>
  );
};

export default ApplicationNPU;
