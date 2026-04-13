/*
	This file contains a stub implementation of the DesignGenerator interface for testing and development purposes.
	It returns hardcoded design results based on the input prompt
*/

package ai

import (
	"context"
	"scalelab-backend/internal/model"
)

type Stub struct{}

func (Stub) Generate(ctx context.Context, input string) (model.DesignResult, error) {
	if err := ctx.Err(); err != nil {
		return model.DesignResult{}, err
	}

	return model.DesignResult{
		Title:   input,
		Summary: "Netflix is a globally distributed video streaming platform serving 200M+ subscribers. The architecture prioritizes low-latency playback, personalized recommendations, and fault tolerance across multiple AWS regions.",

		Requirements: []model.Requirement{
			{
				Name:        "Sub-second playback start",
				Description: "Users expect video playback to begin within 1 second of pressing play, requiring pre-positioned content and adaptive bitrate selection.",
			},
			{
				Name:        "Global availability (99.99%)",
				Description: "The platform must remain accessible worldwide even during regional AWS outages, using active-active multi-region failover.",
			},
			{
				Name:        "Personalized experience",
				Description: "Every user sees a unique homepage — recommendations, artwork, and row ordering are tailored in real-time using ML models.",
			},
			{
				Name:        "Massive read-heavy traffic",
				Description: "Read-to-write ratio exceeds 1000:1 during peak hours. The system must handle 100k+ concurrent streams per region.",
			},
		},

		Components: []model.Component{
			{
				Name:    "CDN (Open Connect)",
				Purpose: "Netflix's custom CDN with appliances embedded in ISP networks, serving 95%+ of video traffic from edge locations closest to users.",
			},
			{
				Name:    "API Gateway (Zuul)",
				Purpose: "Routes and filters all incoming API requests, handles authentication, rate limiting, and request decoration before forwarding to microservices.",
			},
			{
				Name:    "Playback Service",
				Purpose: "Determines optimal streaming URLs, DRM licenses, and adaptive bitrate manifests for each playback session based on device and network conditions.",
			},
			{
				Name:    "Recommendation Engine",
				Purpose: "ML pipeline that generates personalized content rankings, artwork selection, and row ordering for each user's homepage.",
			},
			{
				Name:    "User Profile Service",
				Purpose: "Manages user accounts, profiles, viewing history, and preferences across devices with eventual consistency.",
			},
			{
				Name:    "Content Metadata Service",
				Purpose: "Stores and serves metadata about titles — descriptions, cast, genres, ratings, and relationships between content.",
			},
			{
				Name:    "Encoding Pipeline",
				Purpose: "Transcodes uploaded master files into 1000+ encoding variants per title across resolutions, codecs, and audio formats.",
			},
			{
				Name:    "EVCache",
				Purpose: "Distributed caching layer built on Memcached, handling 30M+ requests/sec to reduce database load for hot data like session state and metadata.",
			},
			{
				Name:    "Cassandra Cluster",
				Purpose: "Primary data store for user activity, viewing history, and bookmarks — chosen for linear write scalability and tunable consistency.",
			},
			{
				Name:    "Kafka Event Bus",
				Purpose: "Central nervous system for asynchronous event streaming — playback events, impression logs, and ML feature updates flow through Kafka topics.",
			},
		},

		Tradeoffs: []model.Tradeoff{
			{
				Decision: "Eventual consistency over strong consistency",
				Pros: []string{
					"much higher availability across regions",
					"lower write latency for global users",
					"Cassandra scales linearly with eventual consistency",
				},
				Cons: []string{
					"users may briefly see stale viewing history across devices",
					"harder to reason about for developers",
					"conflict resolution adds complexity",
				},
			},
			{
				Decision: "Custom CDN (Open Connect) instead of third-party CDN",
				Pros: []string{
					"control over hardware placement inside ISPs",
					"dramatically lower bandwidth costs at scale",
					"sub-100ms content delivery in most markets",
				},
				Cons: []string{
					"massive upfront infrastructure investment",
					"ongoing ISP relationship management",
					"requires dedicated hardware engineering team",
				},
			},
			{
				Decision: "Microservices over monolith",
				Pros: []string{
					"independent deployment and scaling per service",
					"teams own their services end-to-end",
					"failure isolation prevents cascading outages",
				},
				Cons: []string{
					"distributed system complexity (tracing, debugging)",
					"network overhead between services",
					"eventual consistency challenges across service boundaries",
				},
			},
		},

		Bottlenecks: []model.Bottleneck{
			{
				Name:        "Recommendation serving latency",
				Description: "Generating personalized recommendations requires querying ML models, user history, and content metadata — all within 100ms to avoid delaying page load.",
			},
			{
				Name:        "Encoding pipeline throughput",
				Description: "Each new title requires 1000+ encoding variants. A large content drop can create multi-day backlogs in the transcoding pipeline.",
			},
			{
				Name:        "Cache stampede on EVCache failures",
				Description: "When an EVCache node fails, thousands of requests simultaneously hit the backing Cassandra cluster, potentially causing cascading timeouts.",
			},
			{
				Name:        "Peak concurrent streams",
				Description: "Friday evening globally can hit 15M+ concurrent streams. CDN edge capacity and playback service throughput must handle 3x normal load.",
			},
		},

		FailureModes: []model.FailureMode{
			{
				Name:        "Regional AWS outage",
				Description: "If an entire AWS region goes down, DNS-based failover redirects traffic to healthy regions within 60 seconds, but users experience brief playback interruptions.",
			},
			{
				Name:        "CDN edge node failure",
				Description: "If an Open Connect appliance fails inside an ISP, clients fall back to the next-closest edge server, increasing latency but maintaining availability.",
			},
			{
				Name:        "Kafka consumer lag",
				Description: "If recommendation model consumers fall behind on Kafka events, users see stale recommendations until the pipeline catches up — typically minutes, not hours.",
			},
			{
				Name:        "Cassandra node failure",
				Description: "With replication factor 3, a single node failure is transparent. Multi-node failures in the same rack trigger read fallbacks to remote datacenters.",
			},
		},

		ScalingStrategies: []model.ScalingStrategy{
			{
				Name:        "Edge caching via Open Connect",
				Description: "Pre-position popular content on ISP-embedded appliances so 95%+ of bytes never traverse the internet backbone, scaling delivery with ISP partnerships.",
			},
			{
				Name:        "Horizontal Cassandra scaling",
				Description: "Add nodes to the Cassandra ring to linearly increase write throughput. Netflix runs 500+ Cassandra clusters totaling thousands of nodes.",
			},
			{
				Name:        "EVCache tiered caching",
				Description: "Hot data served from in-process L1 cache, warm data from EVCache cluster, cold data from Cassandra — each tier absorbs 90%+ of its inbound requests.",
			},
			{
				Name:        "Chaos Engineering (Chaos Monkey)",
				Description: "Continuously inject failures in production to ensure the system degrades gracefully. Builds confidence that scaling mechanisms actually work under stress.",
			},
		},

		Graph: model.GraphData{
			Nodes: []model.GraphNode{
				{ID: "client", Label: "Client Device", Kind: "client", Description: "Browser, mobile app, smart TV, or game console"},
				{ID: "cdn", Label: "Open Connect CDN", Kind: "cdn", Description: "Edge servers embedded in ISP networks"},
				{ID: "lb", Label: "AWS ELB", Kind: "load_balancer", Description: "Regional load balancer distributing API traffic"},
				{ID: "gateway", Label: "Zuul API Gateway", Kind: "gateway", Description: "Request routing, auth, rate limiting"},
				{ID: "playback", Label: "Playback Service", Kind: "service", Description: "Stream URL resolution and DRM licensing"},
				{ID: "recommend", Label: "Recommendation Engine", Kind: "ml_serving", Description: "Real-time personalized content ranking"},
				{ID: "profile", Label: "User Profile Service", Kind: "service", Description: "User accounts, history, and preferences"},
				{ID: "metadata", Label: "Content Metadata", Kind: "service", Description: "Title info, cast, genres, relationships"},
				{ID: "cache", Label: "EVCache", Kind: "cache", Description: "Distributed Memcached — 30M+ req/sec"},
				{ID: "cassandra", Label: "Cassandra", Kind: "nosql_database", Description: "User activity, viewing history, bookmarks"},
				{ID: "kafka", Label: "Kafka Event Bus", Kind: "message_queue", Description: "Async event streaming for all services"},
				{ID: "encode", Label: "Encoding Pipeline", Kind: "batch_job", Description: "Transcodes to 1000+ variants per title"},
				{ID: "s3", Label: "S3 Object Store", Kind: "object_store", Description: "Master files and encoded video segments"},
			},
			Edges: []model.GraphEdge{
				{ID: "e1", From: "client", To: "cdn", Label: "video stream", Kind: "sync"},
				{ID: "e2", From: "client", To: "lb", Label: "API calls", Kind: "sync"},
				{ID: "e3", From: "lb", To: "gateway", Label: "route", Kind: "sync"},
				{ID: "e4", From: "gateway", To: "playback", Label: "play request", Kind: "sync"},
				{ID: "e5", From: "gateway", To: "recommend", Label: "get recs", Kind: "sync"},
				{ID: "e6", From: "gateway", To: "profile", Label: "user data", Kind: "sync"},
				{ID: "e7", From: "playback", To: "cdn", Label: "stream manifest", Kind: "sync"},
				{ID: "e8", From: "recommend", To: "cache", Label: "feature lookup", Kind: "read"},
				{ID: "e9", From: "profile", To: "cache", Label: "session data", Kind: "read"},
				{ID: "e10", From: "cache", To: "cassandra", Label: "cache miss", Kind: "read"},
				{ID: "e11", From: "metadata", To: "cache", Label: "metadata lookup", Kind: "read"},
				{ID: "e12", From: "playback", To: "kafka", Label: "playback events", Kind: "publish"},
				{ID: "e13", From: "profile", To: "kafka", Label: "activity events", Kind: "publish"},
				{ID: "e14", From: "kafka", To: "recommend", Label: "ML features", Kind: "subscribe"},
				{ID: "e15", From: "encode", To: "s3", Label: "encoded segments", Kind: "write"},
				{ID: "e16", From: "cdn", To: "s3", Label: "origin pull", Kind: "read"},
			},
		},
	}, nil
}

var _ DesignGenerator = Stub{}
