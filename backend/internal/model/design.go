/*
	This file contains the data models for the design service.
	It will hold the shape of data
*/

package model

type GenerateRequest struct {
	Input string `json:"input"`
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

type DesignResult struct {
	Title             string      `json:"title"`
	Summary           string      `json:"summary"`
	Requirements      []string    `json:"requirements"`
	Components        []Component `json:"components"`
	Tradeoffs         []Tradeoff  `json:"tradeoffs"`
	Bottlenecks       []string    `json:"bottlenecks"`
	FailureModes      []string    `json:"failureModes"`
	ScalingStrategies []string    `json:"scalingStrategies"`
}
