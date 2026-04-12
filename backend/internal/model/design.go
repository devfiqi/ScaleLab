/*
	This file contains the data models for the design service.
	It will hold the shape of data
*/

package model

type GenerateRequest struct {
	Input string `json:"input"`
}

type Requirement struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Component struct {
	Name    string `json:"name"`
	Purpose string `json:"purpose"`
}

type Tradeoff struct {
	Decision string   `json:"decision"`
	Pros     []string `json:"pros"`
	Cons     []string `json:"cons"`
}

type Bottleneck struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type FailureMode struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type ScalingStrategy struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type DesignResult struct {
	Title             string            `json:"title"`
	Summary           string            `json:"summary"`
	Requirements      []Requirement     `json:"requirements"`
	Components        []Component       `json:"components"`
	Tradeoffs         []Tradeoff        `json:"tradeoffs"`
	Bottlenecks       []Bottleneck      `json:"bottlenecks"`
	FailureModes      []FailureMode     `json:"failureModes"`
	ScalingStrategies []ScalingStrategy `json:"scalingStrategies"`
}
