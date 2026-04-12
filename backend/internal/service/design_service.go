package service

import "scalelab-backend/internal/model"

func GenerateDesign(input string) model.DesignResult {
	return model.DesignResult{
		Title:   input,
		Summary: "A large-scale distributed system designed to handle high traffic with low latency and high availability.",
		Requirements: []string{
			"high availability",
			"low latency",
			"horizontal scalability",
		},
		Components: []model.Component{
			{
				Name:    "API Gateway",
				Purpose: "Routes client requests to backend services and handles authentication, rate limiting, and request forwarding.",
			},
			{
				Name:    "Application Service",
				Purpose: "Implements the core business logic for the system.",
			},
			{
				Name:    "Primary Database",
				Purpose: "Stores durable application state and metadata.",
			},
		},
		Tradeoffs: []model.Tradeoff{
			{
				Decision: "Use a shared database for consistency",
				Pros: []string{
					"simpler data model",
					"stronger consistency guarantees",
				},
				Cons: []string{
					"can become a bottleneck at scale",
					"harder to scale writes",
				},
			},
		},
		Bottlenecks: []string{
			"database write throughput",
			"hot partitions under uneven traffic",
		},
		FailureModes: []string{
			"database outage affects core read/write paths",
			"traffic spikes can overload application instances",
		},
		ScalingStrategies: []string{
			"horizontal scaling of stateless services",
			"read replicas for read-heavy traffic",
			"caching frequently accessed data",
		},
	}
}
