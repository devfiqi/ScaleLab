package ai

import (
	"context"
	"fmt"
	"os"
	"strings"
)

// NewFromEnv returns Stub, Gemini, or OpenAI based on DESIGN_AI_PROVIDER and API keys.
//
// If DESIGN_AI_PROVIDER is unset: auto-detects based on which API key is set.
// DESIGN_AI_PROVIDER: "stub" | "gemini" | "openai"
// GEMINI_MODEL: optional, default gemini-2.5-flash
// OPENAI_MODEL: optional, default gpt-4o-mini
func NewFromEnv(ctx context.Context) (DesignGenerator, error) {
	provider := strings.ToLower(strings.TrimSpace(os.Getenv("DESIGN_AI_PROVIDER")))

	geminiKey := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if geminiKey == "" {
		geminiKey = strings.TrimSpace(os.Getenv("GOOGLE_API_KEY"))
	}
	openaiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))

	if provider == "" {
		if openaiKey != "" {
			provider = "openai"
		} else if geminiKey != "" {
			provider = "gemini"
		} else {
			provider = "stub"
		}
	}

	switch provider {
	case "stub":
		return Stub{}, nil
	case "gemini":
		if geminiKey == "" {
			return nil, fmt.Errorf("DESIGN_AI_PROVIDER=gemini requires GEMINI_API_KEY or GOOGLE_API_KEY")
		}
		modelName := strings.TrimSpace(os.Getenv("GEMINI_MODEL"))
		if modelName == "" {
			modelName = "gemini-2.5-flash"
		}
		return NewGemini(ctx, geminiKey, modelName)
	case "openai":
		if openaiKey == "" {
			return nil, fmt.Errorf("DESIGN_AI_PROVIDER=openai requires OPENAI_API_KEY")
		}
		modelName := strings.TrimSpace(os.Getenv("OPENAI_MODEL"))
		if modelName == "" {
			modelName = "gpt-4o-mini"
		}
		return NewOpenAI(openaiKey, modelName)
	default:
		return nil, fmt.Errorf("unknown DESIGN_AI_PROVIDER %q (use stub, gemini, or openai)", provider)
	}
}
