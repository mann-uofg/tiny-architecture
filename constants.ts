import { ProcessorInfo, ProcessorType, ComparisonMetric, ManufacturingStep } from './types';

export const PROCESSORS: Record<ProcessorType, ProcessorInfo> = {
  [ProcessorType.CPU]: {
    id: ProcessorType.CPU,
    name: 'AMD Ryzen™ 9000 (Zen 5)',
    tagline: 'High-Performance Scalar Compute',
    description: 'The Zen 5 architecture represents a significant leap in IPC (Instructions Per Clock). Utilizing a chiplet-based design, it separates the I/O functionality (6nm) from the core compute dies (4nm), allowing for massive cache sizes and high clock speeds optimized for sequential logic and operating system orchestration.',
    corePrinciple: 'MIMD (Multiple Instruction, Multiple Data)',
    architectureStats: {
      cores: '16 Cores / 32 Threads',
      clockSpeed: '5.7 GHz Boost',
      memoryBandwidth: '80+ GB/s (DDR5)'
    },
    color: 'bg-orange-600',
    gradient: 'from-orange-50 to-white',
    bestFor: ['Complex Logic Branching', 'Operating System Kernels', 'Database Management', 'Compilers']
  },
  [ProcessorType.GPU]: {
    id: ProcessorType.GPU,
    name: 'NVIDIA RTX™ 5090 (Blackwell)',
    tagline: 'Massively Parallel Vector Compute',
    description: 'The Blackwell architecture is designed for throughput. By minimizing control logic per core, it fits over 20,000 CUDA cores onto a single package. It excels at SIMT (Single Instruction, Multiple Threads) workloads, processing millions of pixels or tensor operations simultaneously using ultra-fast GDDR7 memory.',
    corePrinciple: 'SIMT (Single Instruction, Multiple Threads)',
    architectureStats: {
      cores: '24,576 CUDA Cores',
      clockSpeed: '2.9 GHz Boost',
      memoryBandwidth: '1,792 GB/s (GDDR7)'
    },
    color: 'bg-emerald-600',
    gradient: 'from-emerald-50 to-white',
    bestFor: ['Rasterization & Ray Tracing', 'Parallel Floating Point', 'Video Transcoding', 'Physics Simulations']
  },
  [ProcessorType.TPU]: {
    id: ProcessorType.TPU,
    name: 'Google TPU v5p (Pod)',
    tagline: 'Systolic Matrix Acceleration',
    description: 'A domain-specific architecture (DSA) built explicitly for dense linear algebra. Unlike CPUs/GPUs that access registers frequently, the TPU uses a systolic array where data flows directly between arithmetic units. This maximizes FLOPS per Watt for the matrix multiplications central to Deep Learning.',
    corePrinciple: 'Systolic Data Flow',
    architectureStats: {
      cores: '8,960 Matrix Units',
      clockSpeed: '1.8 GHz (Efficiency Optimized)',
      memoryBandwidth: '4,800 GB/s (HBM3)'
    },
    color: 'bg-rose-600',
    gradient: 'from-rose-50 to-white',
    bestFor: ['Dense Matrix Multiplication', 'Large Language Model Training', 'Transformer Architecture', 'JAX Workloads']
  },
  [ProcessorType.NPU]: {
    id: ProcessorType.NPU,
    name: 'Hexagon / Neural Engine',
    tagline: 'Low-Power Inference',
    description: 'Optimized for the "Edge". NPUs specialize in quantized math (INT8/INT4), allowing them to run pre-trained neural networks for tasks like FaceID or Voice Isolation with minimal power draw. They typically share Unified Memory with the CPU/GPU.',
    corePrinciple: 'Quantized Vector Inference',
    architectureStats: {
      cores: '32 Neural Cores',
      clockSpeed: 'Variable (Gated)',
      memoryBandwidth: '100 GB/s (Unified)'
    },
    color: 'bg-violet-600',
    gradient: 'from-violet-50 to-white',
    bestFor: ['Real-time Inference', 'Image Signal Processing', 'Voice Activity Detection', 'Battery Optimization']
  },
};

export const SPEC_COMPARISON = [
  { metric: "Transistor Count", cpu: "10 Billion", gpu: "80 Billion", tpu: "50 Billion", npu: "15 Billion (SoC)", desc: "Total physical switches on the die." },
  { metric: "Instruction Set", cpu: "x86-64 / CISC", gpu: "CUDA / PTX", tpu: "XLA (VLIW)", npu: "INT8 / Quantized", desc: "The language and math precision used." },
  { metric: "Core Architecture", cpu: "Few, Complex", gpu: "Many, Simple", tpu: "Systolic Arrays", npu: "Tensor Blocks", desc: "Design philosophy of the processing units." },
  { metric: "Memory Tech", cpu: "DDR5 (Low Latency)", gpu: "GDDR7 (Fast)", tpu: "HBM3 (Wide)", npu: "LPDDR5X (Unified)", desc: "RAM technology used for data access." },
  { metric: "Typical Power", cpu: "100-170 W", gpu: "450 W", tpu: "300 W", npu: "5-10 W", desc: "Thermal design power under load." },
];

export const PROCESSOR_MANUFACTURING_STEPS: Record<ProcessorType, ManufacturingStep[]> = {
  [ProcessorType.CPU]: [
    {
      title: 'Architectural Layout (Zen 5)',
      description: 'Engineers layout the complex branch prediction units and large L3 caches. The design is split into "Chiplets": Core Complex Dies (CCD) and I/O Dies.',
      icon: 'DESIGN'
    },
    {
      title: '5nm/4nm Photolithography',
      description: 'TSMC N4 process is used. Extreme UV light prints the incredibly dense logic libraries required for high-frequency scalar operations.',
      icon: 'LITHO'
    },
    {
      title: 'Heterogeneous Binning',
      description: 'Each die is tested for frequency. The best silicon goes to Ryzen 9. Defective cores are fused off to create Ryzen 5/7 parts.',
      icon: 'TEST'
    },
    {
      title: 'Advanced Packaging',
      description: 'Copper pillars connect the 4nm Compute Dies to the 6nm I/O Die on a specialized substrate, allowing them to talk as one chip.',
      icon: 'PKG'
    },
    {
      title: 'Heat Spreader (IHS) Assembly',
      description: 'A thick nickel-plated copper heat spreader is soldered to the dies to dissipate the concentrated heat density of the small cores.',
      icon: 'ETCH'
    }
  ],
  [ProcessorType.GPU]: [
    {
      title: 'Massive Parallel Layout',
      description: 'The layout focuses on repeating thousands of identical CUDA cores. Redundancy is key; if one sector fails, it can be disabled without killing the chip.',
      icon: 'DESIGN'
    },
    {
      title: 'Reticle Limit Lithography',
      description: 'The GPU die is often the largest chip possible to manufacture (near 800mm²). It requires perfect uniformity across the entire wafer.',
      icon: 'LITHO'
    },
    {
      title: 'Wafer Probing & Yielding',
      description: 'Aggressive binning. An RTX 4090 uses the same AD102 chip as the workstation RTX 6000 but with slightly fewer active cores enabled.',
      icon: 'TEST'
    },
    {
      title: 'Flip-Chip Assembly',
      description: 'The massive die is flipped and mounted via thousands of solder bumps to a PCB. Power delivery pins must be perfectly distributed.',
      icon: 'PKG'
    },
    {
      title: 'Vapor Chamber Integration',
      description: 'Due to 450W+ heat output, the final assembly includes a vacuum-sealed vapor chamber cooler directly contacting the silicon.',
      icon: 'ETCH'
    }
  ],
  [ProcessorType.TPU]: [
    {
      title: 'Systolic Array Design',
      description: 'The floorplan is dominated by large Matrix Multiply Units (MXU). Control logic is minimized to save space for pure arithmetic density.',
      icon: 'DESIGN'
    },
    {
      title: 'HBM Controller Fabrication',
      description: 'Critical focus on the edges of the die where the High Bandwidth Memory (HBM) PHYs are located. These require ultra-precise manufacturing.',
      icon: 'LITHO'
    },
    {
      title: 'TSV Etching',
      description: 'Through-Silicon Vias (TSVs) are etched to allow vertical connectivity, essential for the 3D stacking used in high-performance AI chips.',
      icon: 'ETCH'
    },
    {
      title: 'CoWoS Packaging',
      description: 'Chip-on-Wafer-on-Substrate. The GPU/TPU die and HBM memory stacks are placed side-by-side on a silicon interposer, not a plastic PCB.',
      icon: 'PKG'
    },
    {
      title: 'Pod Integration Test',
      description: 'Unlike consumer chips, TPUs are tested for optical interconnectivity to ensure they can scale to thousands of chips in a Pod.',
      icon: 'TEST'
    }
  ],
  [ProcessorType.NPU]: [
    {
      title: 'SoC Block Integration',
      description: 'The NPU is designed as an IP block (Intellectual Property) to be placed alongside CPU and GPU cores on the same piece of silicon.',
      icon: 'DESIGN'
    },
    {
      title: 'Low-Power Process Node',
      description: 'Fabricated on nodes optimized for density and leakage (power saving) rather than raw clock speed (e.g., TSMC N3E).',
      icon: 'LITHO'
    },
    {
      title: 'Unified Memory Architecture',
      description: 'The NPU is hardwired to the same memory controller as the CPU. No separate VRAM or HBM is attached.',
      icon: 'ETCH'
    },
    {
      title: 'System-Level Test',
      description: 'The chip is tested running actual OS workloads (e.g., FaceID unlock) to ensure the NPU wakes up, infers, and sleeps instantly.',
      icon: 'TEST'
    },
    {
      title: 'Package-on-Package (PoP)',
      description: 'Mobile chips often stack the DRAM memory directly on top of the processor package to save space inside a phone.',
      icon: 'PKG'
    }
  ]
};
