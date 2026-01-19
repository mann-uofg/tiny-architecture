import React, { useState, useEffect, useRef } from 'react';
import { Database, Sparkles, ArrowRight, Brain, Layers, BarChart3, Zap } from 'lucide-react';

const ApplicationTPU: React.FC = () => {
  const [step, setStep] = useState(0); // 0: Idle, 1: Embed, 2: Matrix Compute, 3: Sample, 4: Append
  const [generatedText, setGeneratedText] = useState<string[]>(["The"]);
  const [matrixActive, setMatrixActive] = useState(false);
  
  // Simulation Data
  const TARGET_SENTENCE = ["The", "neural", "network", "learns", "patterns", "deep", "inside", "the", "data"];
  
  const PREDICTIONS = [
    { context: "The", options: [{ word: "neural", prob: 0.85 }, { word: "quick", prob: 0.10 }, { word: "future", prob: 0.05 }] },
    { context: "neural", options: [{ word: "network", prob: 0.92 }, { word: "system", prob: 0.04 }, { word: "processing", prob: 0.04 }] },
    { context: "network", options: [{ word: "learns", prob: 0.78 }, { word: "connects", prob: 0.15 }, { word: "is", prob: 0.07 }] },
    { context: "learns", options: [{ word: "patterns", prob: 0.88 }, { word: "slowly", prob: 0.08 }, { word: "from", prob: 0.04 }] },
    { context: "patterns", options: [{ word: "deep", prob: 0.65 }, { word: "in", prob: 0.25 }, { word: "effectively", prob: 0.10 }] },
    { context: "deep", options: [{ word: "inside", prob: 0.70 }, { word: "learning", prob: 0.20 }, { word: "blue", prob: 0.10 }] },
    { context: "inside", options: [{ word: "the", prob: 0.95 }, { word: "a", prob: 0.03 }, { word: "complex", prob: 0.02 }] },
    { context: "the", options: [{ word: "data", prob: 0.99 }, { word: "matrix", prob: 0.01 }, { word: "cloud", prob: 0.00 }] },
    { context: "data", options: [{ word: "<EOS>", prob: 1.0 }] },
  ];

  const currentStepIndex = Math.min(generatedText.length - 1, PREDICTIONS.length - 1);
  const currentPreds = PREDICTIONS[currentStepIndex] || PREDICTIONS[0];

  // Animation Loop
  useEffect(() => {
    let timer: any;

    const runPipeline = () => {
        // 1. EMBEDDING (Read Context)
        setStep(1); 
        
        timer = setTimeout(() => {
            // 2. MATRIX COMPUTE (The Heavy Lifting)
            setStep(2);
            setMatrixActive(true);
            
            setTimeout(() => {
                setMatrixActive(false);
                // 3. SAMPLING (Probabilities)
                setStep(3);

                setTimeout(() => {
                    // 4. APPEND (Next Word)
                    setStep(4);
                    
                    setTimeout(() => {
                        if (generatedText.length < TARGET_SENTENCE.length) {
                             setGeneratedText(prev => [...prev, TARGET_SENTENCE[prev.length]]);
                             runPipeline(); // Loop
                        } else {
                            // Reset after delay
                            setTimeout(() => {
                                setGeneratedText(["The"]);
                                runPipeline();
                            }, 3000);
                        }
                    }, 800); 
                }, 1200); 
            }, 1500); 
        }, 800); 
    };

    runPipeline();

    return () => clearTimeout(timer);
  }, [generatedText.length]);

  return (
    <div className="bg-slate-50 blueprint-border p-6 h-full flex flex-col relative overflow-hidden">
      
      {/* HEADER */}
      <div className="z-10 mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-rose-600 text-white p-2 rounded-md shadow-lg shadow-rose-200"><Brain size={20} /></div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Large Language Model Inference</h3>
            </div>
            <p className="text-sm text-slate-600 max-w-xl">
                Visualizing how a TPU calculates the probability of the next token by passing input vectors through massive layers of weight matrices.
            </p>
        </div>
        <div className="flex gap-4 text-right">
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">HBM Bandwidth</div>
                <div className="text-xl font-mono font-black text-rose-600">3.2 TB/s</div>
            </div>
            <div className="w-px h-8 bg-slate-300"></div>
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">MXU Utilization</div>
                <div className="text-xl font-mono font-black text-slate-800">{step === 2 ? '98.4%' : '12.1%'}</div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex gap-4 z-10">
         
         {/* SECTION 1: CONTEXT WINDOW (INPUT) */}
         <div className="w-1/4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Database size={14} /> Context Window
            </div>
            <div className={`flex-1 bg-white border-2 rounded-lg p-4 font-mono text-sm leading-relaxed shadow-sm transition-colors duration-300 ${step === 1 ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}>
                {generatedText.map((word, i) => (
                    <span key={i} className="inline-block mr-1.5 animate-fadeIn">
                        {word}
                    </span>
                ))}
                {step === 4 && (
                    <span className="inline-block w-2 h-4 bg-rose-500 animate-pulse align-middle"></span>
                )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono text-right">Sequence Length: {generatedText.length}</div>
         </div>

         {/* ARROW 1 */}
         <div className="flex flex-col justify-center items-center text-slate-300">
             <div className={`transition-all duration-500 ${step >= 1 ? 'text-rose-500 opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'}`}>
                <ArrowRight size={24} />
             </div>
             <div className="text-[9px] font-mono font-bold mt-1 uppercase text-slate-400">Embed</div>
         </div>

         {/* SECTION 2: THE MODEL (MATRIX MULTIPLICATION) */}
         <div className="flex-1 flex flex-col gap-2 relative group">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Layers size={14} /> Transformer Layers (Weights)
            </div>
            
            <div className="flex-1 bg-slate-900 rounded-lg shadow-2xl overflow-hidden relative border-4 border-slate-800 flex flex-col items-center justify-center">
                
                {/* 3D Matrix Visualization */}
                <div className="relative w-64 h-64 perspective-1000">
                    <div className={`
                        w-full h-full grid grid-cols-8 grid-rows-8 gap-1 transition-transform duration-700
                        ${matrixActive ? 'scale-110 rotate-x-10' : 'scale-100'}
                    `}>
                        {Array(64).fill(0).map((_, i) => {
                            const row = Math.floor(i / 8);
                            const col = i % 8;
                            // Matrix Wave Animation Logic
                            const waveDelay = (row + col) * 50;
                            const isLit = matrixActive;

                            return (
                                <div 
                                    key={i}
                                    className={`
                                        rounded-sm transition-all duration-300 border border-white/5
                                        ${isLit ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] border-rose-400' : 'bg-slate-800'}
                                    `}
                                    style={{
                                        transitionDelay: isLit ? `${waveDelay}ms` : '0ms',
                                        opacity: isLit ? 1 : 0.3
                                    }}
                                >
                                    {isLit && Math.random() > 0.7 && (
                                        <div className="absolute inset-0 bg-white opacity-50 animate-ping"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Overlay Text */}
                <div className="absolute bottom-4 left-0 w-full text-center">
                    <div className="inline-block bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-mono text-rose-300 font-bold uppercase tracking-widest">
                            {step === 2 ? 'COMPUTING TENSORS...' : 'IDLE'}
                        </span>
                    </div>
                </div>

                {/* Data Flow Particles */}
                {step === 2 && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50 blur-sm animate-scan-fast"></div>
                    </div>
                )}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>FP16 PRECISION</span>
                <span>128 LAYERS</span>
            </div>
         </div>

         {/* ARROW 2 */}
         <div className="flex flex-col justify-center items-center text-slate-300">
             <div className={`transition-all duration-500 ${step >= 3 ? 'text-rose-500 opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'}`}>
                <ArrowRight size={24} />
             </div>
             <div className="text-[9px] font-mono font-bold mt-1 uppercase text-slate-400">Logits</div>
         </div>

         {/* SECTION 3: PROBABILITY DISTRIBUTION (OUTPUT) */}
         <div className="w-1/4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <BarChart3 size={14} /> Next Token Probability
            </div>
            
            <div className={`flex-1 bg-white border-2 rounded-lg p-4 shadow-sm transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                <div className="space-y-3">
                    {currentPreds.options.map((opt, idx) => (
                        <div key={idx} className="relative group">
                            <div className="flex justify-between text-xs font-mono font-bold mb-1 z-10 relative">
                                <span className={idx === 0 ? "text-slate-900" : "text-slate-500"}>{opt.word}</span>
                                <span className="text-slate-400">{(opt.prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-6 bg-slate-100 rounded-sm overflow-hidden relative">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-rose-500' : 'bg-slate-300'}`}
                                    style={{ 
                                        width: step >= 3 ? `${opt.prob * 100}%` : '0%' 
                                    }}
                                ></div>
                            </div>
                            {idx === 0 && step === 3 && (
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-rose-500 animate-bounce">
                                    <ArrowRight size={14} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Explainers */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Top-K Selection</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                        The TPU outputs a probability score for every word in its vocabulary. The model selects the highest probability token to continue the sequence.
                    </p>
                </div>
            </div>
         </div>

      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-x-10 { transform: rotateX(20deg) rotateY(-10deg); }
        @keyframes scan-fast {
            0% { transform: translateY(-100px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100px); opacity: 0; }
        }
        .animate-scan-fast { animation: scan-fast 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ApplicationTPU;