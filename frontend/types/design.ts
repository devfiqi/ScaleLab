export type Requirement = {
  name: string;
  description: string;
};

export type Component = {
  name: string;
  purpose: string;
};

export type Tradeoff = {
  decision: string;
  pros: string[];
  cons: string[];
};

export type Bottleneck = {
  name: string;
  description: string;
};

export type FailureMode = {
  name: string;
  description: string;
};

export type ScalingStrategy = {
  name: string;
  description: string;
};

export type DesignResult = {
  title: string;
  summary: string;
  requirements: Requirement[];
  components: Component[];
  tradeoffs: Tradeoff[];
  bottlenecks: Bottleneck[];
  failureModes: FailureMode[];
  scalingStrategies: ScalingStrategy[];
};
