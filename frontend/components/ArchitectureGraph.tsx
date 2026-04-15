"use client";

import { useMemo, useEffect, useRef } from "react";
import ReactFlow, {
  BaseEdge,
  Node,
  Edge,
  EdgeProps,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  ConnectionLineType,
  MarkerType,
  getSmoothStepPath,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import type { DesignResult, GraphData } from "@/types/design";
import type { GraphNodeKind, GraphEdgeKind } from "@/types/graph";

/* ── node style groups ── */

type NodeStyle = { bg: string; border: string; text: string };

const S_CLIENT:      NodeStyle = { bg: "#121212", border: "#121212", text: "#F0F0F0" };
const S_TRAFFIC:     NodeStyle = { bg: "#1040C0", border: "#121212", text: "#FFFFFF" };
const S_CDN:         NodeStyle = { bg: "#1040C0", border: "#1040C0", text: "#FFFFFF" };
const S_COMPUTE:     NodeStyle = { bg: "#FFFFFF", border: "#1040C0", text: "#121212" };
const S_REALTIME:    NodeStyle = { bg: "#FFFFFF", border: "#6B3FA0", text: "#121212" };
const S_AUTH:        NodeStyle = { bg: "#FFFFFF", border: "#D02020", text: "#121212" };
const S_DATABASE:    NodeStyle = { bg: "#D02020", border: "#121212", text: "#FFFFFF" };
const S_OBJECT:      NodeStyle = { bg: "#8B1A1A", border: "#121212", text: "#FFFFFF" };
const S_CACHE:       NodeStyle = { bg: "#F0C020", border: "#121212", text: "#121212" };
const S_MESSAGING:   NodeStyle = { bg: "#F0C020", border: "#D08000", text: "#121212" };
const S_SEARCH:      NodeStyle = { bg: "#FFFFFF", border: "#2E8B57", text: "#121212" };
const S_OBSERV:      NodeStyle = { bg: "#FFFFFF", border: "#6B6B6B", text: "#121212" };
const S_PIPELINE:    NodeStyle = { bg: "#FFFFFF", border: "#4A9CA0", text: "#121212" };
const S_ML:          NodeStyle = { bg: "#FFFFFF", border: "#6B3FA0", text: "#121212" };
const S_NOTIFY:      NodeStyle = { bg: "#FFFFFF", border: "#C05080", text: "#121212" };
const S_PAYMENT:     NodeStyle = { bg: "#FFFFFF", border: "#2E8B57", text: "#121212" };
const S_MEDIA:       NodeStyle = { bg: "#FFFFFF", border: "#D08000", text: "#121212" };
const S_GEO:         NodeStyle = { bg: "#FFFFFF", border: "#1040C0", text: "#121212" };
const S_THIRD_PARTY: NodeStyle = { bg: "#FFFFFF", border: "#6B6B6B", text: "#6B6B6B" };

const KIND_STYLES: Record<GraphNodeKind, NodeStyle> = {
  // traffic / entry
  client:         S_CLIENT,
  gateway:        S_TRAFFIC,
  load_balancer:  S_TRAFFIC,
  cdn:            S_CDN,
  edge:           S_CDN,
  reverse_proxy:  S_TRAFFIC,
  dns:            S_TRAFFIC,
  // application compute
  service:        S_COMPUTE,
  worker:         S_COMPUTE,
  job_runner:     S_COMPUTE,
  scheduler:      S_COMPUTE,
  orchestrator:   S_COMPUTE,
  function:       S_COMPUTE,
  websocket:      S_REALTIME,
  realtime:       S_REALTIME,
  // identity / access
  auth:           S_AUTH,
  session_store:  S_AUTH,
  rate_limiter:   S_AUTH,
  feature_flag:   S_AUTH,
  // storage
  database:             S_DATABASE,
  sql_database:         S_DATABASE,
  nosql_database:       S_DATABASE,
  time_series_database: S_DATABASE,
  graph_database:       S_DATABASE,
  vector_database:      S_DATABASE,
  data_warehouse:       S_DATABASE,
  object_store:         S_OBJECT,
  blob_store:           S_OBJECT,
  index_store:          S_OBJECT,
  // caching
  cache:             S_CACHE,
  distributed_cache: S_CACHE,
  local_cache:       S_CACHE,
  // messaging / eventing
  queue:             S_MESSAGING,
  stream:            S_MESSAGING,
  pubsub:            S_MESSAGING,
  event_bus:         S_MESSAGING,
  dead_letter_queue: S_MESSAGING,
  // search / retrieval
  search:       S_SEARCH,
  indexer:      S_SEARCH,
  autocomplete: S_SEARCH,
  ranking:      S_SEARCH,
  // observability
  analytics:  S_OBSERV,
  metrics:    S_OBSERV,
  logging:    S_OBSERV,
  tracing:    S_OBSERV,
  monitoring: S_OBSERV,
  alerting:   S_OBSERV,
  // data pipelines
  etl:          S_PIPELINE,
  ingestion:    S_PIPELINE,
  pipeline:     S_PIPELINE,
  aggregator:   S_PIPELINE,
  materializer: S_PIPELINE,
  // ml / intelligence
  ml_inference:      S_ML,
  feature_store:     S_ML,
  model_store:       S_ML,
  training_pipeline: S_ML,
  // domain services
  notification:    S_NOTIFY,
  email:           S_NOTIFY,
  sms:             S_NOTIFY,
  payment:         S_PAYMENT,
  billing:         S_PAYMENT,
  media_processor: S_MEDIA,
  transcoder:      S_MEDIA,
  thumbnailer:     S_MEDIA,
  geo_service:     S_GEO,
  map_service:     S_GEO,
  // external
  third_party: S_THIRD_PARTY,
};

/* ── edge styles ── */

const EDGE_STYLE_MAP: Record<GraphEdgeKind, { stroke: string; dash?: string; animated?: boolean }> = {
  sync:        { stroke: "#121212" },
  async:       { stroke: "#1040C0", dash: "6 3", animated: true },
  read:        { stroke: "#1040C0" },
  write:       { stroke: "#D02020" },
  replication: { stroke: "#6B6B6B", dash: "4 4" },
  publish:     { stroke: "#D08000", dash: "6 3", animated: true },
  consume:     { stroke: "#D08000" },
  cache_fill:  { stroke: "#F0C020" },
  invalidate:  { stroke: "#D02020", dash: "4 4" },
  upload:      { stroke: "#8B1A1A" },
  download:    { stroke: "#1040C0" },
  index:       { stroke: "#2E8B57" },
  fanout:      { stroke: "#C05080", dash: "6 3", animated: true },
};

/* ── layout constants ── */

const NODE_WIDTH = 200;
const NODE_HEIGHT = 58;
const BASE_LAYOUT_WIDTH = 230;
const BASE_LAYOUT_HEIGHT = 78;
const RANK_SEP = 110;
const NODE_SEP = 100;
const EDGE_SEP = 40;
const EDGE_TURN_OFFSET = 40;
const EDGE_CURVE_RADIUS = 16;
const SAME_PAIR_EDGE_SPREAD = 26;

type LayoutMeta = { x: number; y: number };

type RoutedEdgeData = {
  turnOffset?: number;
  sourcePos?: Position;
  targetPos?: Position;
};

/* ── per-edge handle direction based on relative node positions ── */

function edgeHandles(
  srcPos: LayoutMeta,
  tgtPos: LayoutMeta,
): { sourcePos: Position; targetPos: Position } {
  const dx = tgtPos.x - srcPos.x;
  const dy = tgtPos.y - srcPos.y;

  if (dy > NODE_HEIGHT * 0.8 && Math.abs(dx) < Math.abs(dy) * 1.2) {
    return { sourcePos: Position.Bottom, targetPos: Position.Top };
  }
  if (dy < -NODE_HEIGHT * 0.8 && Math.abs(dx) < Math.abs(dy) * 1.2) {
    return { sourcePos: Position.Top, targetPos: Position.Bottom };
  }
  if (dx > 0) {
    return { sourcePos: Position.Right, targetPos: Position.Left };
  }
  return { sourcePos: Position.Left, targetPos: Position.Right };
}

/* ── count edges per node for layout inflation ── */

function nodeDegrees(edges: Edge[]): Map<string, number> {
  const deg = new Map<string, number>();
  edges.forEach((e) => {
    deg.set(e.source, (deg.get(e.source) || 0) + 1);
    deg.set(e.target, (deg.get(e.target) || 0) + 1);
  });
  return deg;
}

/* ── dagre layout with per-edge handle computation ── */

function layoutGraph(
  nodes: Node[],
  edges: Edge[],
): { laidOut: Node[]; edgeHandleMap: Map<string, { sourcePos: Position; targetPos: Position }> } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB",
    ranksep: RANK_SEP,
    nodesep: NODE_SEP,
    edgesep: EDGE_SEP,
    marginx: 40,
    marginy: 40,
    ranker: "network-simplex",
  });

  const degrees = nodeDegrees(edges);
  nodes.forEach((n) => {
    const deg = degrees.get(n.id) || 0;
    const extra = deg > 4 ? 30 : deg > 2 ? 15 : 0;
    g.setNode(n.id, {
      width: BASE_LAYOUT_WIDTH + extra,
      height: BASE_LAYOUT_HEIGHT + extra * 0.4,
    });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const layoutMeta = new Map<string, LayoutMeta>();
  nodes.forEach((n) => {
    const pos = g.node(n.id);
    layoutMeta.set(n.id, { x: pos.x, y: pos.y });
  });

  // Compute per-edge handle directions
  const edgeHandleMap = new Map<string, { sourcePos: Position; targetPos: Position }>();
  edges.forEach((e) => {
    const src = layoutMeta.get(e.source);
    const tgt = layoutMeta.get(e.target);
    if (src && tgt) {
      edgeHandleMap.set(e.id, edgeHandles(src, tgt));
    }
  });

  // Per-node default positions from majority edge directions
  const nodeSrcVotes = new Map<string, Record<string, number>>();
  const nodeTgtVotes = new Map<string, Record<string, number>>();
  edges.forEach((e) => {
    const handles = edgeHandleMap.get(e.id);
    if (!handles) return;
    const sv = nodeSrcVotes.get(e.source) || {};
    sv[handles.sourcePos] = (sv[handles.sourcePos] || 0) + 1;
    nodeSrcVotes.set(e.source, sv);
    const tv = nodeTgtVotes.get(e.target) || {};
    tv[handles.targetPos] = (tv[handles.targetPos] || 0) + 1;
    nodeTgtVotes.set(e.target, tv);
  });

  function majorityPos(votes: Record<string, number> | undefined, fallback: Position): Position {
    if (!votes) return fallback;
    let best = fallback;
    let bestCount = 0;
    for (const [pos, count] of Object.entries(votes)) {
      if (count > bestCount) {
        best = pos as Position;
        bestCount = count;
      }
    }
    return best;
  }

  const laidOut = nodes.map((n) => {
    const pos = layoutMeta.get(n.id);
    if (!pos) return n;
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      sourcePosition: majorityPos(nodeSrcVotes.get(n.id), Position.Bottom),
      targetPosition: majorityPos(nodeTgtVotes.get(n.id), Position.Top),
    };
  });

  return { laidOut, edgeHandleMap };
}

/* ── stamp per-edge handle positions into edge data ── */

function applyEdgeHandles(
  edges: Edge[],
  handleMap: Map<string, { sourcePos: Position; targetPos: Position }>,
): Edge[] {
  return edges.map((e) => {
    const handles = handleMap.get(e.id);
    if (!handles) return e;
    return {
      ...e,
      data: {
        ...(e.data as RoutedEdgeData),
        sourcePos: handles.sourcePos,
        targetPos: handles.targetPos,
      },
    };
  });
}

/* ── post-layout: hide labels that collide with node bounding boxes ── */

type NodeBox = { id: string; x1: number; y1: number; x2: number; y2: number };

function buildNodeBoxes(nodes: Node[], pad: number): NodeBox[] {
  return nodes.map((n) => ({
    id: n.id,
    x1: n.position.x - pad,
    y1: n.position.y - pad,
    x2: n.position.x + NODE_WIDTH + pad,
    y2: n.position.y + NODE_HEIGHT + pad,
  }));
}

function labelCollidesWithNode(
  lx: number,
  ly: number,
  boxes: NodeBox[],
  sourceId: string,
  targetId: string,
): boolean {
  const hw = 38, hh = 10;
  return boxes.some(
    (b) =>
      b.id !== sourceId &&
      b.id !== targetId &&
      lx + hw >= b.x1 &&
      lx - hw <= b.x2 &&
      ly + hh >= b.y1 &&
      ly - hh <= b.y2,
  );
}

function markCongestedLabels(edges: Edge[], nodes: Node[]): Edge[] {
  const boxes = buildNodeBoxes(nodes, 12);

  const nodePos = new Map<string, { cx: number; cy: number }>();
  nodes.forEach((n) => {
    nodePos.set(n.id, {
      cx: n.position.x + NODE_WIDTH / 2,
      cy: n.position.y + NODE_HEIGHT / 2,
    });
  });

  const placedLabels: { x: number; y: number }[] = [];

  return edges.map((e) => {
    if (!e.label) return e;
    const src = nodePos.get(e.source);
    const tgt = nodePos.get(e.target);
    if (!src || !tgt) return e;

    const midX = (src.cx + tgt.cx) / 2;
    const midY = (src.cy + tgt.cy) / 2;

    const hitsNode = labelCollidesWithNode(midX, midY, boxes, e.source, e.target);
    const hitsLabel = placedLabels.some(
      (p) => Math.abs(p.x - midX) < 60 && Math.abs(p.y - midY) < 18,
    );

    if (!hitsNode && !hitsLabel) {
      placedLabels.push({ x: midX, y: midY });
      return e;
    }

    return { ...e, label: undefined };
  });
}

/* ── spread edges sharing the same source–target pair ── */

function spreadEdges(edges: Edge[]): Edge[] {
  const pairMap: Record<string, number> = {};
  const pairCount: Record<string, number> = {};
  edges.forEach((e) => {
    const key = `${e.source}→${e.target}`;
    pairCount[key] = (pairCount[key] || 0) + 1;
  });

  return edges.map((e) => {
    const key = `${e.source}→${e.target}`;
    const count = pairCount[key];
    if (count <= 1) return e;

    const idx = pairMap[key] || 0;
    pairMap[key] = idx + 1;

    const offset = (idx - (count - 1) / 2) * SAME_PAIR_EDGE_SPREAD;

    return {
      ...e,
      data: {
        ...(e.data as RoutedEdgeData | undefined),
        turnOffset: EDGE_TURN_OFFSET + Math.abs(offset),
      },
      pathOptions: { offset },
    };
  });
}

/* ── custom edge component with per-edge handle overrides ── */

function RoutedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  data,
}: EdgeProps<RoutedEdgeData>) {
  const srcPos = data?.sourcePos ?? sourcePosition;
  const tgtPos = data?.targetPos ?? targetPosition;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: srcPos,
    targetPosition: tgtPos,
    borderRadius: EDGE_CURVE_RADIUS,
    offset: data?.turnOffset ?? EDGE_TURN_OFFSET,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={style}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={labelStyle}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      interactionWidth={20}
    />
  );
}

const edgeTypes = { routed: RoutedEdge };

/* ── transform graph data → react flow ── */

function toReactFlowNodes(data: GraphData): Node[] {
  return data.nodes.map((n) => {
    const style = KIND_STYLES[n.kind as GraphNodeKind] || S_COMPUTE;
    return {
      id: n.id,
      data: { label: n.label },
      position: { x: 0, y: 0 },
      style: {
        background: style.bg,
        color: style.text,
        border: `3px solid ${style.border}`,
        boxShadow: "4px 4px 0 #121212",
        borderRadius: 0,
        fontFamily: "Outfit, sans-serif",
        fontWeight: 700,
        fontSize: "12px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        padding: "12px 16px",
        minWidth: NODE_WIDTH,
        maxWidth: NODE_WIDTH,
      },
    };
  });
}

function toReactFlowEdges(data: GraphData): Edge[] {
  return data.edges.map((e) => {
    const edgeKind = (e.kind || "sync") as GraphEdgeKind;
    const edgeStyle = EDGE_STYLE_MAP[edgeKind] || EDGE_STYLE_MAP.sync;
    return {
      id: e.id,
      source: e.from,
      target: e.to,
      label: e.label,
      type: "routed",
      data: { turnOffset: EDGE_TURN_OFFSET },
      animated: edgeStyle.animated || false,
      style: {
        stroke: edgeStyle.stroke,
        strokeWidth: 2,
        strokeDasharray: edgeStyle.dash,
      },
      labelStyle: {
        fontFamily: "Outfit, sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        fill: "#6B6B6B",
      },
      labelBgStyle: {
        fill: "#F0F0F0",
        stroke: "#121212",
        strokeWidth: 1,
      },
      labelBgPadding: [6, 3] as [number, number],
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: edgeStyle.stroke },
    };
  });
}

/* ── derive graph from components (fallback when backend has no graph data) ── */

function deriveGraphFromComponents(data: DesignResult): GraphData {
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  nodes.push({ id: "client", label: "Client", kind: "client" });

  data.components.forEach((c, i) => {
    const id = `comp-${i}`;
    const kindGuess = guessKind(c.name, c.purpose);
    nodes.push({ id, label: c.name, kind: kindGuess });
  });

  if (data.components.length > 0) {
    edges.push({ id: "e-client-0", from: "client", to: "comp-0", label: "request", kind: "sync" });
  }

  for (let i = 0; i < data.components.length - 1; i++) {
    const toKind = guessKind(data.components[i + 1].name, data.components[i + 1].purpose);
    const edgeKind = inferEdgeKind(toKind);
    edges.push({
      id: `e-${i}-${i + 1}`,
      from: `comp-${i}`,
      to: `comp-${i + 1}`,
      kind: edgeKind,
    });
  }

  return { nodes, edges };
}

function guessKind(name: string, purpose: string): GraphNodeKind {
  const lower = (name + " " + purpose).toLowerCase();

  // traffic
  if (lower.includes("gateway") || lower.includes("api gate")) return "gateway";
  if (lower.includes("load balanc")) return "load_balancer";
  if (lower.includes("cdn") || lower.includes("cloudfront")) return "cdn";
  if (lower.includes("reverse proxy") || lower.includes("nginx proxy")) return "reverse_proxy";

  // compute
  if (lower.includes("websocket") || lower.includes("socket server")) return "websocket";
  if (lower.includes("worker") || lower.includes("background")) return "worker";
  if (lower.includes("cron") || lower.includes("scheduler")) return "scheduler";
  if (lower.includes("orchestrat")) return "orchestrator";
  if (lower.includes("lambda") || lower.includes("serverless") || lower.includes("cloud function")) return "function";

  // auth
  if (lower.includes("auth") || lower.includes("identity") || lower.includes("oauth")) return "auth";
  if (lower.includes("session store") || lower.includes("session")) return "session_store";
  if (lower.includes("rate limit")) return "rate_limiter";

  // storage — specific before generic
  if (lower.includes("postgres") || lower.includes("mysql") || lower.includes("sql") || lower.includes("relational")) return "sql_database";
  if (lower.includes("mongo") || lower.includes("dynamo") || lower.includes("nosql") || lower.includes("cassandra") || lower.includes("document")) return "nosql_database";
  if (lower.includes("time series") || lower.includes("influx") || lower.includes("timescale")) return "time_series_database";
  if (lower.includes("neo4j") || lower.includes("graph db") || lower.includes("graph database")) return "graph_database";
  if (lower.includes("vector") || lower.includes("pinecone") || lower.includes("embedding")) return "vector_database";
  if (lower.includes("warehouse") || lower.includes("bigquery") || lower.includes("redshift") || lower.includes("snowflake")) return "data_warehouse";
  if (lower.includes("object stor") || lower.includes("s3") || lower.includes("gcs") || lower.includes("blob")) return "object_store";
  if (lower.includes("database") || lower.includes("db") || lower.includes("data store")) return "database";

  // cache
  if (lower.includes("redis") || lower.includes("memcache") || lower.includes("distributed cache")) return "distributed_cache";
  if (lower.includes("cache")) return "cache";

  // messaging
  if (lower.includes("kafka") || lower.includes("kinesis") || lower.includes("event stream")) return "stream";
  if (lower.includes("pubsub") || lower.includes("pub/sub")) return "pubsub";
  if (lower.includes("event bus")) return "event_bus";
  if (lower.includes("dead letter")) return "dead_letter_queue";
  if (lower.includes("queue") || lower.includes("rabbit") || lower.includes("sqs")) return "queue";

  // search
  if (lower.includes("elastic") || lower.includes("solr") || lower.includes("search engine")) return "search";
  if (lower.includes("indexer") || lower.includes("index")) return "indexer";
  if (lower.includes("autocomplete") || lower.includes("typeahead")) return "autocomplete";
  if (lower.includes("ranking") || lower.includes("relevance")) return "ranking";

  // observability
  if (lower.includes("metric")) return "metrics";
  if (lower.includes("logging") || lower.includes("log sink")) return "logging";
  if (lower.includes("tracing") || lower.includes("trace")) return "tracing";
  if (lower.includes("monitor")) return "monitoring";
  if (lower.includes("alert")) return "alerting";
  if (lower.includes("analytic")) return "analytics";

  // pipelines
  if (lower.includes("etl")) return "etl";
  if (lower.includes("ingest")) return "ingestion";
  if (lower.includes("pipeline")) return "pipeline";
  if (lower.includes("aggregat")) return "aggregator";
  if (lower.includes("materializ")) return "materializer";

  // ml
  if (lower.includes("inference") || lower.includes("ml model") || lower.includes("prediction")) return "ml_inference";
  if (lower.includes("feature store")) return "feature_store";
  if (lower.includes("recommendation") || lower.includes("recommend")) return "ml_inference";
  if (lower.includes("training")) return "training_pipeline";

  // domain
  if (lower.includes("notification") || lower.includes("push")) return "notification";
  if (lower.includes("email") || lower.includes("sendgrid") || lower.includes("ses")) return "email";
  if (lower.includes("sms") || lower.includes("twilio")) return "sms";
  if (lower.includes("payment") || lower.includes("stripe") || lower.includes("checkout")) return "payment";
  if (lower.includes("billing") || lower.includes("invoice") || lower.includes("subscription")) return "billing";
  if (lower.includes("transcode") || lower.includes("transcoder") || lower.includes("ffmpeg")) return "transcoder";
  if (lower.includes("thumbnail") || lower.includes("thumb")) return "thumbnailer";
  if (lower.includes("media process") || lower.includes("media upload")) return "media_processor";
  if (lower.includes("geo") || lower.includes("location") || lower.includes("gps")) return "geo_service";
  if (lower.includes("map") || lower.includes("routing")) return "map_service";

  // external
  if (lower.includes("third party") || lower.includes("external api") || lower.includes("vendor")) return "third_party";

  return "service";
}

function inferEdgeKind(toKind: GraphNodeKind): GraphEdgeKind {
  // storage
  if (["database", "sql_database", "nosql_database", "time_series_database", "graph_database", "vector_database", "data_warehouse"].includes(toKind)) return "write";
  if (["object_store", "blob_store"].includes(toKind)) return "upload";
  if (["index_store"].includes(toKind)) return "index";

  // cache
  if (["cache", "distributed_cache", "local_cache"].includes(toKind)) return "read";

  // messaging
  if (["queue", "stream", "pubsub", "event_bus", "dead_letter_queue"].includes(toKind)) return "publish";

  // search
  if (["search", "indexer", "autocomplete", "ranking"].includes(toKind)) return "read";

  // notifications
  if (["notification", "email", "sms"].includes(toKind)) return "fanout";

  return "sync";
}

/* ── default graph for landing page ── */

const DEFAULT_GRAPH: GraphData = {
  nodes: [
    { id: "client",  label: "Client",          kind: "client" },
    { id: "gw",      label: "API Gateway",     kind: "gateway" },
    { id: "limiter", label: "Limiter Service",  kind: "rate_limiter" },
    { id: "redis",   label: "Redis Cache",      kind: "distributed_cache" },
    { id: "config",  label: "Config Service",   kind: "service" },
    { id: "metrics", label: "Metrics Sink",     kind: "metrics" },
  ],
  edges: [
    { id: "e1", from: "client",  to: "gw",      label: "HTTP request", kind: "sync" },
    { id: "e2", from: "gw",      to: "limiter",  label: "check limit",  kind: "sync" },
    { id: "e3", from: "limiter", to: "redis",    label: "read token",   kind: "read" },
    { id: "e4", from: "limiter", to: "redis",    label: "decrement",    kind: "write" },
    { id: "e5", from: "limiter", to: "config",   label: "fetch policy", kind: "sync" },
    { id: "e6", from: "limiter", to: "metrics",  label: "emit event",   kind: "publish" },
  ],
};

/* ── compute viewport from known node positions ── */

function computeViewport(
  nodes: Node[],
  containerWidth: number,
  containerHeight: number,
  padding: number,
): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) return { x: 0, y: 0, zoom: 1 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
    maxY = Math.max(maxY, n.position.y + NODE_HEIGHT);
  });

  const graphW = maxX - minX;
  const graphH = maxY - minY;
  const usableW = containerWidth * (1 - padding * 2);
  const usableH = containerHeight * (1 - padding * 2);

  const zoom = Math.min(usableW / graphW, usableH / graphH, 1);
  const x = (containerWidth - graphW * zoom) / 2 - minX * zoom;
  const y = (containerHeight - graphH * zoom) / 2 - minY * zoom;

  return { x, y, zoom: Math.max(zoom, 0.1) };
}

/* ── component ── */

type ArchitectureGraphProps = {
  result: DesignResult | null;
};

function ArchitectureGraphInner({ result }: ArchitectureGraphProps) {
  const { setViewport, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => {
    if (!result) return DEFAULT_GRAPH;
    if (result.graph && result.graph.nodes && result.graph.nodes.length > 0) {
      return result.graph;
    }
    return deriveGraphFromComponents(result);
  }, [result]);

  const rawNodes = useMemo(() => toReactFlowNodes(graphData), [graphData]);
  const rawEdges = useMemo(() => spreadEdges(toReactFlowEdges(graphData)), [graphData]);
  const { laidOut, edgeHandleMap } = useMemo(() => layoutGraph(rawNodes, rawEdges), [rawNodes, rawEdges]);
  const handledEdges = useMemo(() => applyEdgeHandles(rawEdges, edgeHandleMap), [rawEdges, edgeHandleMap]);
  const finalEdges = useMemo(() => markCongestedLabels(handledEdges, laidOut), [handledEdges, laidOut]);

  const [nodes, setNodes, onNodesChange] = useNodesState(laidOut);
  const [edges, setEdges, onEdgesChange] = useEdgesState(finalEdges);

  useEffect(() => {
    setNodes(laidOut);
    setEdges(finalEdges);

    const el = containerRef.current;
    const w = el?.clientWidth || 1024;
    const h = el?.clientHeight || 720;
    const vp = computeViewport(laidOut, w, h, 0.04);

    const t1 = setTimeout(() => setViewport(vp, { duration: 0 }), 50);
    const t2 = setTimeout(() => fitView({ padding: 0.04, includeHiddenNodes: true }), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [laidOut, finalEdges, setNodes, setEdges, setViewport, fitView]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.1}
        maxZoom={2}
      />
    </div>
  );
}

export default function ArchitectureGraph({ result }: ArchitectureGraphProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-10 pt-2">
      <div className="mb-6 flex items-center gap-3 border-b-2 border-fg pb-3">
        <div className="h-3 w-3 rounded-full bg-bh-red" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em]">
          Architecture
        </h2>
      </div>

      <div className="border-3 border-fg bg-card shadow-hard-lg" style={{ height: 720 }}>
        <ReactFlowProvider>
          <ArchitectureGraphInner result={result} />
        </ReactFlowProvider>
      </div>
    </section>
  );
}
