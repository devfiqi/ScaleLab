/*
	Ai backend for DesginGeneratr
		- Takes in users text
		- sends buildPrompt to gemini
		- asks for JSON
		- return to model.DesignResult
*/

package ai

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"scalelab-backend/internal/model"

	"google.golang.org/genai"
)

// Gemini calls the Gemini Developer API and parses JSON into model.DesignResult.
type Gemini struct {
	client *genai.Client
	model  string
}

// NewGemini creates a Gemini-backed generator
func NewGemini(ctx context.Context, apiKey, model string) (*Gemini, error) {
	if strings.TrimSpace(apiKey) == "" {
		return nil, errors.New("gemini: empty API key")
	}
	if strings.TrimSpace(model) == "" {
		return nil, errors.New("gemini: empty model")
	}

	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}

	return &Gemini{client: client, model: model}, nil
}

func (g *Gemini) Generate(ctx context.Context, input string) (model.DesignResult, error) {
	if err := ctx.Err(); err != nil {
		return model.DesignResult{}, err
	}

	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return model.DesignResult{}, errors.New("gemini: empty input")
	}

	user := genai.NewContentFromText(buildPrompt(trimmed), genai.RoleUser)
	temp := float32(0.35)
	cfg := &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		Temperature:      &temp,
		MaxOutputTokens:  8192,
	}

	resp, err := g.client.Models.GenerateContent(ctx, g.model, []*genai.Content{user}, cfg)
	if err != nil {
		return model.DesignResult{}, err
	}
	if resp != nil && resp.PromptFeedback != nil && resp.PromptFeedback.BlockReason != "" {
		return model.DesignResult{}, fmt.Errorf("gemini: prompt blocked: %s", resp.PromptFeedback.BlockReason)
	}

	raw := extractText(resp)
	raw = stripJSONFence(raw)
	if strings.TrimSpace(raw) == "" {
		return model.DesignResult{}, errors.New("gemini: empty model response")
	}

	var out model.DesignResult
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return model.DesignResult{}, fmt.Errorf("gemini: invalid JSON: %w", err)
	}
	if err := validateDesignResult(out); err != nil {
		return model.DesignResult{}, err
	}
	return out, nil
}

func extractText(resp *genai.GenerateContentResponse) string {
	if resp == nil || len(resp.Candidates) == 0 || resp.Candidates[0] == nil {
		return ""
	}
	content := resp.Candidates[0].Content
	if content == nil {
		return ""
	}
	var b strings.Builder
	for _, p := range content.Parts {
		if p != nil && p.Text != "" {
			b.WriteString(p.Text)
		}
	}
	return b.String()
}

func stripJSONFence(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```") {
		s = strings.TrimPrefix(s, "```")
		s = strings.TrimSpace(s)
		if strings.HasPrefix(strings.ToLower(s), "json") {
			if idx := strings.IndexByte(s, '\n'); idx >= 0 {
				s = strings.TrimSpace(s[idx+1:])
			}
		}
		if i := strings.LastIndex(s, "```"); i >= 0 {
			s = strings.TrimSpace(s[:i])
		}
	}
	return strings.TrimSpace(s)
}

func validateDesignResult(d model.DesignResult) error {
	if strings.TrimSpace(d.Title) == "" {
		return errors.New("gemini: missing title")
	}
	if strings.TrimSpace(d.Summary) == "" {
		return errors.New("gemini: missing summary")
	}
	if len(d.Requirements) == 0 || len(d.Components) == 0 || len(d.Tradeoffs) == 0 {
		return errors.New("gemini: incomplete sections")
	}
	return nil
}

var _ DesignGenerator = (*Gemini)(nil)
