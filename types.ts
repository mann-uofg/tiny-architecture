export enum ProcessorType {
  CPU = 'CPU',
  GPU = 'GPU',
  TPU = 'TPU',
  NPU = 'NPU'
}

export interface ProcessorInfo {
  id: ProcessorType;
  name: string;
  tagline: string;
  description: string;
  corePrinciple: string;
  architectureStats: {
    cores: string;
    clockSpeed: string;
    memoryBandwidth: string;
  };
  color: string;
  gradient: string;
  bestFor: string[];
}

export interface ComparisonMetric {
  label: string;
  cpu: number | string;
  gpu: number | string;
  tpu: number | string;
  npu: number | string;
  unit: string;
  description: string;
}

export interface ManufacturingStep {
  title: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
