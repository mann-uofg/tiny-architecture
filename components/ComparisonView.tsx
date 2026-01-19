import React from 'react';
import { SPEC_COMPARISON } from '../constants';
import { ProcessorType } from '../types';

interface Props {
  activeType: ProcessorType;
}

const ComparisonView: React.FC<Props> = ({ activeType }) => {
  const getHighlightClass = (type: ProcessorType) => {
    if (activeType === type) {
      // Return specific styling based on type
      switch (type) {
        case ProcessorType.CPU: return "bg-orange-50 border-x-2 border-orange-200 ring-inset ring-orange-100";
        case ProcessorType.GPU: return "bg-emerald-50 border-x-2 border-emerald-200 ring-inset ring-emerald-100";
        case ProcessorType.TPU: return "bg-rose-50 border-x-2 border-rose-200 ring-inset ring-rose-100";
        case ProcessorType.NPU: return "bg-violet-50 border-x-2 border-violet-200 ring-inset ring-violet-100";
        default: return "";
      }
    }
    return "";
  };

  const getHeaderHighlight = (type: ProcessorType) => {
     if (activeType === type) {
       return "bg-white/10 backdrop-blur-sm shadow-inner";
     }
     return "text-slate-400";
  };

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
       <table className="w-full text-left border-collapse">
         <thead>
           <tr className="bg-slate-900 text-white font-mono text-xs uppercase">
             <th className="p-4 w-1/5 border-r border-slate-700">Metric</th>
             <th className={`p-4 w-1/5 border-r border-slate-700 transition-colors ${getHeaderHighlight(ProcessorType.CPU)}`}>
               <span className={activeType === ProcessorType.CPU ? "text-orange-400 font-bold" : "text-orange-400/70"}>CPU (Ryzen)</span>
             </th>
             <th className={`p-4 w-1/5 border-r border-slate-700 transition-colors ${getHeaderHighlight(ProcessorType.GPU)}`}>
               <span className={activeType === ProcessorType.GPU ? "text-emerald-400 font-bold" : "text-emerald-400/70"}>GPU (RTX)</span>
             </th>
             <th className={`p-4 w-1/5 border-r border-slate-700 transition-colors ${getHeaderHighlight(ProcessorType.TPU)}`}>
               <span className={activeType === ProcessorType.TPU ? "text-rose-400 font-bold" : "text-rose-400/70"}>TPU (v5p)</span>
             </th>
             <th className={`p-4 w-1/5 transition-colors ${getHeaderHighlight(ProcessorType.NPU)}`}>
               <span className={activeType === ProcessorType.NPU ? "text-violet-400 font-bold" : "text-violet-400/70"}>NPU (Hexagon)</span>
             </th>
           </tr>
         </thead>
         <tbody className="font-mono text-xs md:text-sm text-slate-700">
           {SPEC_COMPARISON.map((row, idx) => (
             <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
               <td className="p-4 border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50">
                  {row.metric}
                  <div className="text-[10px] font-sans font-normal text-slate-400 mt-1 leading-tight">{row.desc}</div>
               </td>
               <td className={`p-4 border-r border-slate-200 transition-colors ${getHighlightClass(ProcessorType.CPU)}`}>{row.cpu}</td>
               <td className={`p-4 border-r border-slate-200 transition-colors ${getHighlightClass(ProcessorType.GPU)}`}>{row.gpu}</td>
               <td className={`p-4 border-r border-slate-200 transition-colors ${getHighlightClass(ProcessorType.TPU)}`}>{row.tpu}</td>
               <td className={`p-4 transition-colors ${getHighlightClass(ProcessorType.NPU)}`}>{row.npu}</td>
             </tr>
           ))}
         </tbody>
       </table>
       <div className="p-2 bg-slate-50 text-right text-[10px] font-mono text-slate-400">
          * SPECS ARE APPROXIMATE FOR ARCHITECTURAL COMPARISON
       </div>
    </div>
  );
};

export default ComparisonView;
