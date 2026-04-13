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

export type GraphNode = {
  id: string;
  label: string;
  kind: string;
  description?: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
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
  graph?: GraphData;
};
