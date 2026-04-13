/*
	AI backend using OpenAI API (GPT-4o-mini)
		- Takes user text
		- Sends buildPrompt to OpenAI
		- Asks for JSON
		- Returns model.DesignResult
*/

package ai

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"scalelab-backend/internal/model"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/openai/openai-go/shared"
)

// OpenAI calls the OpenAI API and parses JSON into model.DesignResult.
type OpenAI struct {
	client openai.Client
	model  string
}

// NewOpenAI creates an OpenAI-backed generator.
func NewOpenAI(apiKey, modelName string) (*OpenAI, error) {
	if strings.TrimSpace(apiKey) == "" {
		return nil, errors.New("openai: empty API key")
	}
	if strings.TrimSpace(modelName) == "" {
		modelName = "gpt-4o-mini"
	}

	client := openai.NewClient(option.WithAPIKey(apiKey))

	return &OpenAI{client: client, model: modelName}, nil
}

func (o *OpenAI) Generate(ctx context.Context, input string) (model.DesignResult, error) {
	if err := ctx.Err(); err != nil {
		return model.DesignResult{}, err
	}

	trimmed := strings.TrimSpace(input)
	if trimmed == "" {
		return model.DesignResult{}, errors.New("openai: empty input")
	}

	prompt := buildPrompt(trimmed)

	resp, err := o.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: openai.ChatModel(o.model),
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("You are an expert systems designer. You respond ONLY with valid JSON, no markdown fences, no commentary."),
			openai.UserMessage(prompt),
		},
		Temperature: openai.Float(0.35),
		MaxTokens:   openai.Int(8192),
		ResponseFormat: openai.ChatCompletionNewParamsResponseFormatUnion{
			OfJSONObject: openai.Ptr(shared.NewResponseFormatJSONObjectParam()),
		},
	})
	if err != nil {
		return model.DesignResult{}, fmt.Errorf("openai: %w", err)
	}

	if len(resp.Choices) == 0 {
		return model.DesignResult{}, errors.New("openai: no choices returned")
	}

	raw := resp.Choices[0].Message.Content
	raw = stripJSONFence(raw)
	if strings.TrimSpace(raw) == "" {
		return model.DesignResult{}, errors.New("openai: empty model response")
	}

	var out model.DesignResult
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		return model.DesignResult{}, fmt.Errorf("openai: invalid JSON: %w", err)
	}
	if err := validateDesignResult(out); err != nil {
		return model.DesignResult{}, err
	}
	return out, nil
}

var _ DesignGenerator = (*OpenAI)(nil)
