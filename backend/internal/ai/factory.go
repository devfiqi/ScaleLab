package ai

import (
	"context"
	"fmt"
	"os"
	"strings"
)

// NewFromEnv returns Stub or Gemini based on DESIGN_AI_PROVIDER and API keys.
//
// If DESIGN_AI_PROVIDER is unset: uses gemini when GEMINI_API_KEY or GOOGLE_API_KEY is set, otherwise stub.
// DESIGN_AI_PROVIDER: "stub" | "gemini"
// GEMINI_MODEL: optional, default gemini-2.5-flash
func NewFromEnv(ctx context.Context) (DesignGenerator, error) {
	provider := strings.ToLower(strings.TrimSpace(os.Getenv("DESIGN_AI_PROVIDER")))
	key := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if key == "" {
		key = strings.TrimSpace(os.Getenv("GOOGLE_API_KEY"))
	}

	if provider == "" {
		if key != "" {
			provider = "gemini"
		} else {
			provider = "stub"
		}
	}

	switch provider {
	case "stub":
		return Stub{}, nil
	case "gemini":
		if key == "" {
			return nil, fmt.Errorf("DESIGN_AI_PROVIDER=gemini requires GEMINI_API_KEY or GOOGLE_API_KEY")
		}
		modelName := strings.TrimSpace(os.Getenv("GEMINI_MODEL"))
		if modelName == "" {
			modelName = "gemini-2.5-flash"
		}
		return NewGemini(ctx, key, modelName)
	default:
		return nil, fmt.Errorf("unknown DESIGN_AI_PROVIDER %q (use stub or gemini)", provider)
	}
}
