"use client";

import { useMemo, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import type { DesignResult } from "@/types/design";
import type { GraphData, GraphNodeKind, GraphEdgeKind } from "@/types/graph";

/* ── colour mapping by node kind ── */

const KIND_STYLES: Record<
  GraphNodeKind,
  { bg: string; border: string; text: string }
> = {
  client:        { bg: "#121212", border: "#121212", text: "#F0F0F0" },
  gateway:       { bg: "#1040C0", border: "#121212", text: "#FFFFFF" },
  load_balancer: { bg: "#1040C0", border: "#121212", text: "#FFFFFF" },
  service:       { bg: "#FFFFFF", border: "#1040C0", text: "#121212" },
  worker:        { bg: "#FFFFFF", border: "#1040C0", text: "#121212" },
  cache:         { bg: "#F0C020", border: "#121212", text: "#121212" },
  database:      { bg: "#D02020", border: "#121212", text: "#FFFFFF" },
  queue:         { bg: "#F0C020", border: "#121212", text: "#121212" },
  stream:        { bg: "#F0C020", border: "#121212", text: "#121212" },
  object_store:  { bg: "#D02020", border: "#121212", text: "#FFFFFF" },
  cdn:           { bg: "#FFFFFF", border: "#6B6B6B", text: "#121212" },
  auth:          { bg: "#FFFFFF", border: "#D02020", text: "#121212" },
  search:        { bg: "#FFFFFF", border: "#6B6B6B", text: "#121212" },
  analytics:     { bg: "#FFFFFF", border: "#6B6B6B", text: "#121212" },
  third_party:   { bg: "#FFFFFF", border: "#6B6B6B", text: "#121212" },
};

const EDGE_STYLE_MAP: Record<GraphEdgeKind, { stroke: string; dash?: string }> = {
  sync:        { stroke: "#121212" },
  async:       { stroke: "#1040C0", dash: "6 3" },
  read:        { stroke: "#1040C0" },
  write:       { stroke: "#D02020" },
  replication: { stroke: "#6B6B6B", dash: "4 4" },
};

/* ── dagre layout ── */

const NODE_WIDTH = 180;
const NODE_HEIGHT = 52;

function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 70, nodesep: 50 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
}

/* ── transform graph data → react flow ── */

function toReactFlowNodes(data: GraphData): Node[] {
  return data.nodes.map((n) => {
    const style = KIND_STYLES[n.kind] || KIND_STYLES.service;
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
        width: NODE_WIDTH,
      },
    };
  });
}

function toReactFlowEdges(data: GraphData): Edge[] {
  return data.edges.map((e) => {
    const edgeKind = e.kind || "sync";
    const edgeStyle = EDGE_STYLE_MAP[edgeKind] || EDGE_STYLE_MAP.sync;
    return {
      id: e.id,
      source: e.from,
      target: e.to,
      label: e.label,
      type: "smoothstep",
      animated: edgeKind === "async",
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

/* ── derive graph from components (when no explicit graph data) ── */

function deriveGraphFromComponents(data: DesignResult): GraphData {
  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  nodes.push({ id: "client", label: "Client", kind: "client" });

  data.components.forEach((c, i) => {
    const id = `comp-${i}`;
    const kindGuess = guessKind(c.name, c.purpose);
    nodes.push({ id, label: c.name, kind: kindGuess });
  });

  // client → first component
  if (data.components.length > 0) {
    edges.push({ id: "e-client-0", from: "client", to: "comp-0", label: "request", kind: "sync" });
  }

  // chain components in order
  for (let i = 0; i < data.components.length - 1; i++) {
    const fromKind = guessKind(data.components[i].name, data.components[i].purpose);
    const toKind = guessKind(data.components[i + 1].name, data.components[i + 1].purpose);
    const edgeKind = inferEdgeKind(fromKind, toKind);
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
  if (lower.includes("gateway") || lower.includes("api gate")) return "gateway";
  if (lower.includes("load balanc")) return "load_balancer";
  if (lower.includes("cache") || lower.includes("redis") || lower.includes("memcache")) return "cache";
  if (lower.includes("database") || lower.includes("db") || lower.includes("postgres") || lower.includes("mysql") || lower.includes("dynamo") || lower.includes("mongo")) return "database";
  if (lower.includes("queue") || lower.includes("rabbit") || lower.includes("sqs")) return "queue";
  if (lower.includes("stream") || lower.includes("kafka")) return "stream";
  if (lower.includes("cdn") || lower.includes("cloudfront")) return "cdn";
  if (lower.includes("auth") || lower.includes("identity") || lower.includes("oauth")) return "auth";
  if (lower.includes("search") || lower.includes("elastic") || lower.includes("solr")) return "search";
  if (lower.includes("analytic") || lower.includes("metric")) return "analytics";
  if (lower.includes("worker") || lower.includes("background") || lower.includes("cron")) return "worker";
  if (lower.includes("object stor") || lower.includes("s3") || lower.includes("blob")) return "object_store";
  if (lower.includes("third") || lower.includes("external") || lower.includes("payment") || lower.includes("stripe")) return "third_party";
  return "service";
}

function inferEdgeKind(from: GraphNodeKind, to: GraphNodeKind): GraphEdgeKind {
  if (to === "database" || to === "object_store") return "write";
  if (to === "cache") return "read";
  if (to === "queue" || to === "stream") return "async";
  return "sync";
}

/* ── default graph for landing page ── */

const DEFAULT_GRAPH: GraphData = {
  nodes: [
    { id: "client",  label: "Client",          kind: "client" },
    { id: "gw",      label: "API Gateway",     kind: "gateway" },
    { id: "limiter", label: "Limiter Service",  kind: "service" },
    { id: "redis",   label: "Redis Cluster",    kind: "cache" },
    { id: "config",  label: "Config Service",   kind: "service" },
    { id: "metrics", label: "Metrics Sink",     kind: "analytics" },
  ],
  edges: [
    { id: "e1", from: "client",  to: "gw",      label: "HTTP request", kind: "sync" },
    { id: "e2", from: "gw",      to: "limiter",  label: "check limit",  kind: "sync" },
    { id: "e3", from: "limiter", to: "redis",    label: "read token",   kind: "read" },
    { id: "e4", from: "limiter", to: "redis",    label: "decrement",    kind: "write" },
    { id: "e5", from: "limiter", to: "config",   label: "fetch policy", kind: "sync" },
    { id: "e6", from: "limiter", to: "metrics",  label: "emit event",   kind: "async" },
  ],
};

/* ── component ── */

type ArchitectureGraphProps = {
  result: DesignResult | null;
};

export default function ArchitectureGraph({ result }: ArchitectureGraphProps) {
  const graphData = useMemo(() => {
    if (!result) return DEFAULT_GRAPH;
    return deriveGraphFromComponents(result);
  }, [result]);

  const rawNodes = useMemo(() => toReactFlowNodes(graphData), [graphData]);
  const rawEdges = useMemo(() => toReactFlowEdges(graphData), [graphData]);
  const laidOut = useMemo(() => layoutGraph(rawNodes, rawEdges), [rawNodes, rawEdges]);

  const [nodes, , onNodesChange] = useNodesState(laidOut);
  const [edges, , onEdgesChange] = useEdgesState(rawEdges);

  const onInit = useCallback((instance: any) => {
    setTimeout(() => instance.fitView({ padding: 0.2 }), 0);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 pb-10 pt-2">
      <div className="mb-6 flex items-center gap-3 border-b-2 border-fg pb-3">
        <div className="h-3 w-3 rounded-full bg-bh-red" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em]">
          Architecture
        </h2>
      </div>

      <div className="border-3 border-fg bg-card shadow-hard-lg" style={{ height: 480 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          minZoom={0.3}
          maxZoom={2}
        />
      </div>
    </section>
  );
}
