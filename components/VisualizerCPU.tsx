import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Cpu, Pause, ArrowRight, ArrowDown } from 'lucide-react';

const VisualizerCPU: React.FC = () => {
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'FETCH' | 'DECODE' | 'EXECUTE' | 'WRITEBACK'>('FETCH');
  
  // Hardware State
  const [pc, setPc] = useState(0x00); // Program Counter
  const [ir, setIr] = useState('');   // Instruction Register
  const [mar, setMar] = useState(0);  // Memory Address Register
  const [mdr, setMdr] = useState(0);  // Memory Data Register
  const [acc, setAcc] = useState(0);  // Accumulator
  const [aluRes, setAluRes] = useState(0); // ALU Result Buffer

  // Simulated Memory (Code + Data)
  const memory = [
    { op: 'LDA', arg: 0x05, code: 0x15 }, // Load value at addr 5 to ACC
    { op: 'ADD', arg: 0x06, code: 0x26 }, // Add value at addr 6 to ACC
    { op: 'SUB', arg: 0x07, code: 0x37 }, // Sub value at addr 7 from ACC
    { op: 'STO', arg: 0x08, code: 0x48 }, // Store ACC to addr 8
    { op: 'HLT', arg: 0x00, code: 0x00 }, // Halt
    { val: 10 }, // Addr 5 (Data)
    { val: 25 }, // Addr 6 (Data)
    { val: 5  }, // Addr 7 (Data)
    { val: 0  }, // Addr 8 (Output)
  ];

  // Micro-operations per clock cycle
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setClock(c => c + 1);
        
        switch (phase) {
          case 'FETCH':
            setMar(pc); // T0: PC -> MAR
            // Simulate memory read latency
            setTimeout(() => {
               const instr = memory[pc];
               setMdr(instr.code || 0); // T1: MEM[MAR] -> MDR
               setIr(`${instr.op} ${instr.arg !== undefined ? `0x0${instr.arg}` : ''}`); // T2: MDR -> IR
               setPc(p => p + 1); // PC Increment
               setPhase('DECODE');
            }, 500);
            break;
            
          case 'DECODE':
            // T3: Decode Opcode (Simulated delay)
            setPhase('EXECUTE');
            break;

          case 'EXECUTE':
            const [op, argStr] = ir.split(' ');
            const arg = parseInt(argStr, 16);
            
            if (op === 'LDA') {
               setMar(arg);
               const val = memory[arg]?.val || 0;
               setMdr(val);
               setAcc(val);
            } else if (op === 'ADD') {
               setMar(arg);
               const val = memory[arg]?.val || 0;
               setMdr(val);
               setAluRes(acc + val);
               setAcc(acc + val);
            } else if (op === 'SUB') {
               setMar(arg);
               const val = memory[arg]?.val || 0;
               setMdr(val);
               setAluRes(acc - val);
               setAcc(acc - val);
            } else if (op === 'STO') {
               setMar(arg);
               setMdr(acc);
               memory[arg].val = acc; // Write to simulated RAM
            } else if (op === 'HLT') {
               setIsPlaying(false);
            }
            setPhase('WRITEBACK');
            break;

          case 'WRITEBACK':
            // Results technically written in EXEC for this simple model, 
            // but this stage represents latching results back to registers
            if (pc >= 4) { // End of demo program loop
               setTimeout(() => {
                 setPc(0);
                 setAcc(0);
                 setPhase('FETCH');
               }, 2000);
            } else {
               setPhase('FETCH');
            }
            break;
        }
      }, 1500); // 1.5s per major cycle step for readability
    }
    return () => clearInterval(interval);
  }, [isPlaying, phase, pc, acc, ir]);

  // -- Component for a Register Box --
  // Scaled up size and fonts
  const Register = ({ label, value, active, bus = false, bits = 8 }: any) => (
    <div className={`relative border-2 transition-all duration-300 p-3 min-w-[120px] text-center bg-white ${active ? 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105' : 'border-slate-300'}`}>
       <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</div>
       <div className={`font-mono text-xl font-bold ${active ? 'text-blue-600' : 'text-slate-800'}`}>
         {bus ? 'BUS' : `0x${value?.toString(16).toUpperCase().padStart(2, '0')}`}
       </div>
       <div className="absolute -top-3 -right-2 bg-slate-100 text-[10px] text-slate-600 px-2 py-0.5 border border-slate-200 shadow-sm font-mono">{bits}-bit</div>
    </div>
  );

  return (
    <div className="bg-slate-50 blueprint-border p-8 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-200 z-10">
        <div>
           <h3 className="font-mono font-black text-slate-900 text-2xl uppercase flex items-center gap-3">
             <Cpu className="text-slate-900" size={28}/> Von Neumann Datapath
           </h3>
           <div className="text-sm font-mono text-slate-500 mt-2">
             CLOCK: <span className="text-slate-900 font-bold">{clock} CYCLES</span> | PHASE: <span className="text-blue-600 font-bold text-base">{phase}</span>
           </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setPc(0); setAcc(0); setClock(0); setPhase('FETCH'); }} className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-md font-bold text-sm font-mono transition-colors">SYS_RESET</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-sm flex items-center gap-3 font-mono transition-colors">
            {isPlaying ? <><Pause size={16}/> HALT_CLK</> : <><Play size={16}/> START_CLK</>}
          </button>
        </div>
      </div>

      {/* Main Schematic Diagram */}
      <div className="flex-1 relative grid grid-cols-12 gap-8">
         
         {/* Background Grid & Bus Lines */}
         <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Main Data Bus (Vertical Center) */}
            <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#94a3b8" strokeWidth="16" />
            
            {/* Connections to Bus */}
            <line x1="20%" y1="20%" x2="50%" y2="20%" stroke="#cbd5e1" strokeWidth="6" /> {/* PC to Bus */}
            <line x1="20%" y1="40%" x2="50%" y2="40%" stroke="#cbd5e1" strokeWidth="6" /> {/* MAR to Bus */}
            <line x1="80%" y1="20%" x2="50%" y2="20%" stroke="#cbd5e1" strokeWidth="6" /> {/* MEM to Bus */}
            <line x1="50%" y1="60%" x2="80%" y2="60%" stroke="#cbd5e1" strokeWidth="6" /> {/* Bus to IR */}
            <line x1="20%" y1="60%" x2="50%" y2="60%" stroke="#cbd5e1" strokeWidth="6" /> {/* ACC to Bus */}
         </svg>

         {/* Left Column: Control & Addressing */}
         <div className="col-span-3 flex flex-col justify-around items-center z-10 py-6">
            <Register label="Program Counter" value={pc} active={phase === 'FETCH'} />
            <div className="h-12 w-2 bg-slate-300"></div>
            <Register label="Mem. Addr. Reg" value={mar} active={phase === 'FETCH' || phase === 'EXECUTE'} />
            <div className="h-12 w-2 bg-slate-300"></div>
            <Register label="Accumulator" value={acc} active={phase === 'EXECUTE' && ir.includes('ADD')} />
         </div>

         {/* Center Column: The Bus & ALU */}
         <div className="col-span-6 flex flex-col items-center justify-between py-12 z-10">
             <div className="bg-slate-200 text-slate-500 font-mono font-bold text-sm px-6 py-2 rounded-full mb-4 border border-slate-300 shadow-sm">SYSTEM BUS (8-BIT)</div>
             
             {/* ALU Block - Scaled Up */}
             <div className="relative mt-auto mb-4">
               <div className="w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-t-[100px] border-t-slate-800 filter drop-shadow-xl"></div>
               <div className="absolute top-[-70px] left-[-30px] text-white font-black font-mono text-2xl">ALU</div>
               <div className="absolute top-[-40px] w-full text-center text-sm text-slate-300 font-mono tracking-widest">
                  {phase === 'EXECUTE' ? ir.split(' ')[0] : 'IDLE'}
               </div>
             </div>
         </div>

         {/* Right Column: Memory & Instruction Decoding */}
         <div className="col-span-3 flex flex-col justify-around items-center z-10 py-6">
            {/* RAM Block - Scaled */}
            <div className={`border-2 border-slate-800 bg-white p-4 w-48 shadow-lg ${phase === 'FETCH' ? 'ring-4 ring-blue-100 scale-105 transition-transform' : ''}`}>
               <div className="text-xs font-bold text-slate-500 mb-3 border-b pb-2">MAIN MEMORY (RAM)</div>
               <div className="space-y-1.5">
                 {memory.map((m, i) => (
                   <div key={i} className={`flex justify-between text-xs font-mono p-1 rounded-sm ${i === mar ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <span>0x{i.toString(16).toUpperCase()}</span>
                      <span className="font-bold">{m.op ? m.op : `0x${m.val?.toString(16).toUpperCase()}`}</span>
                   </div>
                 ))}
               </div>
            </div>

            <Register label="Instruction Reg" value={ir} active={phase === 'DECODE'} bits={16} bus />
            
            {/* Control Unit */}
            <div className="border-2 border-slate-400 bg-slate-100 p-4 w-40 text-center mt-6 shadow-md">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Control Unit</div>
               <div className="text-sm font-bold text-slate-900 font-mono mt-2">
                 {phase === 'DECODE' ? 'DECODING...' : 'WAITING'}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default VisualizerCPU;
