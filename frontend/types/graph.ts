export type GraphNodeKind =
  // traffic / entry
  | "client"
  | "gateway"
  | "load_balancer"
  | "cdn"
  | "edge"
  | "reverse_proxy"
  | "dns"
  // application compute
  | "service"
  | "worker"
  | "job_runner"
  | "scheduler"
  | "orchestrator"
  | "function"
  | "websocket"
  | "realtime"
  // identity / access
  | "auth"
  | "session_store"
  | "rate_limiter"
  | "feature_flag"
  // storage
  | "database"
  | "sql_database"
  | "nosql_database"
  | "time_series_database"
  | "graph_database"
  | "vector_database"
  | "data_warehouse"
  | "object_store"
  | "blob_store"
  | "index_store"
  // caching
  | "cache"
  | "distributed_cache"
  | "local_cache"
  // messaging / eventing
  | "queue"
  | "stream"
  | "pubsub"
  | "event_bus"
  | "dead_letter_queue"
  // search / retrieval
  | "search"
  | "indexer"
  | "autocomplete"
  | "ranking"
  // observability
  | "analytics"
  | "metrics"
  | "logging"
  | "tracing"
  | "monitoring"
  | "alerting"
  // data pipelines
  | "etl"
  | "ingestion"
  | "pipeline"
  | "aggregator"
  | "materializer"
  // ml / intelligence
  | "ml_inference"
  | "feature_store"
  | "model_store"
  | "training_pipeline"
  // domain services
  | "notification"
  | "email"
  | "sms"
  | "payment"
  | "billing"
  | "media_processor"
  | "transcoder"
  | "thumbnailer"
  | "geo_service"
  | "map_service"
  // external
  | "third_party";

export type GraphEdgeKind =
  | "sync"
  | "async"
  | "read"
  | "write"
  | "replication"
  | "publish"
  | "consume"
  | "cache_fill"
  | "invalidate"
  | "upload"
  | "download"
  | "index"
  | "fanout";

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
