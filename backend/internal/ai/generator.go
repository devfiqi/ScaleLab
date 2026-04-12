/*
	Defines the interface for the design generator service
	This is the core of the AI generation logic, and can be implemented using different AI models or services.
*/

package ai

import (
	"context"
	"scalelab-backend/internal/model"
)

type DesignGenerator interface {
	Generate(ctx context.Context, input string) (model.DesignResult, error)
}
