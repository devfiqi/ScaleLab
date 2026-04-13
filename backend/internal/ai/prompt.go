/*
	Prompt the Ai Model recieves
*/

package ai

import "fmt"

// buildPrompt returns the user message sent to the model. It instructs the model to
// emit a single JSON object matching scalelab-backend/internal/model.DesignResult
func buildPrompt(userInput string) string {
	return fmt.Sprintf(`You are a principal systems architect. The user describes a system to design. Produce a PRODUCTION-GRADE architecture — the kind presented in a staff-level system design interview.

User request:
%q

Respond with ONLY valid JSON (no markdown code fences, no commentary). The JSON must use exactly these top-level keys:

- "title": string — the system name (e.g. "Netflix Streaming Platform")
- "summary": string — 3–4 sentences covering scale, key challenges, and architectural philosophy
- "requirements": array of objects with "name" and "description" — include BOTH functional AND non-functional requirements. Be specific with numbers (e.g. "200M users", "99.99%% uptime", "sub-100ms latency"). At least 5 items.
- "components": array of objects with "name" and "purpose" — name real technologies where appropriate (e.g. "Cassandra" not "Database", "Kafka" not "Message Queue", "Redis" not "Cache"). At least 6 items.
- "tradeoffs": array of objects with "decision", "pros" (array of strings), "cons" (array of strings) — each with at least 3 pros and 3 cons. At least 3 tradeoffs.
- "bottlenecks": array of objects with "name" and "description" — be specific about WHY it's a bottleneck and at what scale. At least 3 items.
- "failureModes": array of objects with "name" and "description" — describe the blast radius and recovery strategy. At least 3 items.
- "scalingStrategies": array of objects with "name" and "description" — explain the mechanism, not just the name. At least 3 items.
- "graph": object with "nodes" and "edges" for a DETAILED architecture diagram

=== GRAPH RULES — THIS IS THE MOST IMPORTANT PART ===

The graph should look like a REAL system design diagram for the SPECIFIC system requested. It must feel application-specific, not like a generic cloud architecture poster.

PHILOSOPHY:
- Favor DOMAIN/BUSINESS services over generic infrastructure. For Netflix: "Playback Service", "Content Catalog", "Recommendation Engine", "Watch History Service" — NOT "Service A", "Service B", "Microservice".
- Split responsibilities into separate services when it improves clarity. A "User Service" that also handles auth, profiles, billing, and watch history is too vague. Break it up.
- Storage should match access patterns: SQL for relational data, NoSQL for high-write scale, object store for media, search index for queries, cache for hot reads. Show WHY each store exists.
- Show the FULL request lifecycle: synchronous request path (user clicks play → what happens), async background processing (events, pipelines, jobs), and data flow between services.

NODE RULES:
- "nodes": array of objects with "id" (unique lowercase-kebab), "label" (application-specific name — e.g. "Watch History Service", "Content Catalog DB", "Transcoding Pipeline", "Recommendation Model"), "kind" (from allowed list), and "description" (1 sentence)
- Use 10-15 nodes. Choose ONLY components this specific system actually needs. Do NOT pad with generic infra.
- ALWAYS include a "client" node as entry point
- Include at least 2-3 domain-specific services (not just "API" and "Backend")
- Include at least 1 async processing path (queue/stream → worker/consumer)
- Include storage that matches the system's data needs (not just one generic database)
- Only include observability/analytics if the system genuinely needs it (e.g. recommendation systems need analytics pipelines, a URL shortener does not)

EDGE RULES:
- "edges": array of objects with "id" (unique), "from" (source node id), "to" (target node id), "label" (SPECIFIC action like "fetch stream manifest", "log watch event", "invalidate cache entry" — NOT "request" or "data"), and "kind" (from allowed list)
- Show realistic branching — services fan out to multiple stores, multiple producers feed queues
- Clearly distinguish sync request paths from async event flows
- Every edge MUST have a meaningful label

Allowed node kinds:
- Traffic: "client", "gateway", "load_balancer", "cdn", "edge", "reverse_proxy", "dns"
- Compute: "service", "worker", "job_runner", "scheduler", "orchestrator", "function", "websocket", "realtime"
- Auth: "auth", "session_store", "rate_limiter", "feature_flag"
- Storage: "database", "sql_database", "nosql_database", "time_series_database", "graph_database", "vector_database", "data_warehouse", "object_store", "blob_store", "index_store"
- Cache: "cache", "distributed_cache", "local_cache"
- Messaging: "queue", "stream", "pubsub", "event_bus", "dead_letter_queue", "message_queue"
- Search: "search", "indexer", "autocomplete", "ranking"
- Observability: "analytics", "metrics", "logging", "tracing", "monitoring", "alerting"
- Pipelines: "etl", "ingestion", "pipeline", "aggregator", "materializer", "batch_job"
- ML: "ml_inference", "ml_serving", "feature_store", "model_store", "training_pipeline"
- Domain: "notification", "email", "sms", "payment", "billing", "media_processor", "transcoder", "thumbnailer", "geo_service", "map_service"
- External: "third_party"

Allowed edge kinds: "sync", "async", "read", "write", "replication", "publish", "subscribe", "consume", "cache_fill", "invalidate", "upload", "download", "index", "fanout"

Use "label" for specific descriptive names. Use "kind" strictly from allowed lists. Do NOT invent new kinds.

Be concrete and specific to the user's system. Name real technologies. Include specific scale numbers. This should read like a senior engineer's design doc, not a textbook summary.`, userInput)
}
