import React from 'react';
import { PROCESSOR_MANUFACTURING_STEPS } from '../constants';
import { ArrowRight, Box, Cpu, Microscope, Zap, Database } from 'lucide-react';
import { ProcessorType } from '../types';

interface Props {
  type: ProcessorType;
}

const ManufacturingView: React.FC<Props> = ({ type }) => {
  const steps = PROCESSOR_MANUFACTURING_STEPS[type];

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'DESIGN': return <Box size={24} />;
      case 'LITHO': return <Zap size={24} />;
      case 'ETCH': return <Microscope size={24} />;
      case 'TEST': return <Cpu size={24} />;
      case 'PKG': return <Database size={24} />;
      default: return <Box size={24} />;
    }
  };

  const getColor = () => {
    switch(type) {
        case ProcessorType.CPU: return "group-hover:bg-orange-600 group-hover:text-white";
        case ProcessorType.GPU: return "group-hover:bg-emerald-600 group-hover:text-white";
        case ProcessorType.TPU: return "group-hover:bg-rose-600 group-hover:text-white";
        case ProcessorType.NPU: return "group-hover:bg-violet-600 group-hover:text-white";
        default: return "group-hover:bg-slate-900 group-hover:text-white";
    }
  }

  const getBarColor = () => {
    switch(type) {
        case ProcessorType.CPU: return "group-hover:bg-orange-600";
        case ProcessorType.GPU: return "group-hover:bg-emerald-600";
        case ProcessorType.TPU: return "group-hover:bg-rose-600";
        case ProcessorType.NPU: return "group-hover:bg-violet-600";
        default: return "group-hover:bg-slate-900";
    }
  }

  return (
    <div className="bg-white rounded-none border border-slate-200 p-0 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {steps.map((step, idx) => (
          <div key={idx} className="p-6 group hover:bg-slate-50 transition-colors relative">
             <div className={`absolute top-0 left-0 w-full h-1 bg-slate-100 transition-colors ${getBarColor()}`}></div>
             
             <div className="flex justify-between items-start mb-4">
               <div className={`w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-sm ${getColor()}`}>
                  {getIcon(step.icon)}
               </div>
               <span className="font-mono text-4xl font-bold text-slate-100 group-hover:text-slate-200 select-none transition-colors">
                 0{idx + 1}
               </span>
             </div>
             
             <h4 className="font-mono font-bold text-sm text-slate-900 uppercase mb-3 min-h-[40px] flex items-center">{step.title}</h4>
             <p className="text-xs text-slate-500 leading-relaxed font-sans border-t border-slate-100 pt-3">
               {step.description}
             </p>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-50 p-4 border-t border-slate-200 text-center font-mono text-[10px] text-slate-400">
        PROCESS SIMULATION • {type} ARCHITECTURE FLOW
      </div>
    </div>
  );
};

export default ManufacturingView;
