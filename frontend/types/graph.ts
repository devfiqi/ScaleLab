export type GraphNodeKind =
  | "client"
  | "gateway"
  | "load_balancer"
  | "service"
  | "worker"
  | "cache"
  | "database"
  | "queue"
  | "stream"
  | "object_store"
  | "cdn"
  | "auth"
  | "search"
  | "analytics"
  | "third_party";

export type GraphEdgeKind = "sync" | "async" | "read" | "write" | "replication";

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  description?: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind?: GraphEdgeKind;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
