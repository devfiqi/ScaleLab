/*
	Given some input text, return a design result
*/

package service

import "scalelab-backend/internal/model"

func GenerateDesign(input string) model.DesignResult {
	return model.DesignResult{
		Title:   input,
		Summary: "A large-scale distributed system designed to handle high traffic with low latency and high availability.",

		Requirements: []model.Requirement{
			{
				Name:        "High Availability",
				Description: "The system should remain operational despite instance or infrastructure failures so users can continue accessing the service.",
			},
			{
				Name:        "Low Latency",
				Description: "The system should respond quickly to user requests to maintain a smooth user experience under normal and peak traffic.",
			},
			{
				Name:        "Horizontal Scalability",
				Description: "The system should support growth by adding more machines instead of relying on a single larger machine.",
			},
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

		Bottlenecks: []model.Bottleneck{
			{
				Name:        "Database write throughput",
				Description: "Writes are harder to scale than reads, and a single primary database can become saturated as traffic and update volume grow.",
			},
			{
				Name:        "Hot partitions under uneven traffic",
				Description: "If a small subset of keys receives disproportionate traffic, those partitions can overload while the rest of the system remains underutilized.",
			},
		},

		FailureModes: []model.FailureMode{
			{
				Name:        "Database outage affects core read/write paths",
				Description: "If the primary database becomes unavailable, critical application functionality may stop working because durable state cannot be read or updated.",
			},
			{
				Name:        "Traffic spikes can overload application instances",
				Description: "Sudden increases in request volume can exhaust CPU, memory, or connection limits before autoscaling or mitigation mechanisms react.",
			},
		},

		ScalingStrategies: []model.ScalingStrategy{
			{
				Name:        "Horizontal scaling of stateless services",
				Description: "Stateless services are easier to replicate across many instances, allowing request load to be distributed more evenly.",
			},
			{
				Name:        "Read replicas for read-heavy traffic",
				Description: "Replicas reduce pressure on the primary database by offloading read queries, improving throughput for read-dominant workloads.",
			},
			{
				Name:        "Caching frequently accessed data",
				Description: "Caching reduces repeated work and lowers latency by serving common requests without hitting downstream services or the database every time.",
			},
		},
	}
}