/*
	Take an HTTP request, turn it into Go data, call the design generator, turn the result back into HTTP response
*/

package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"scalelab-backend/internal/ai"
	"scalelab-backend/internal/model"
)

const maxGenerateBodyBytes = 64 << 10

// Routes holds dependencies for HTTP handlers.
type Routes struct {
	Gen ai.DesignGenerator
}

// Generate handles POST /generate using the configured AI backend (stub or Gemini).
func (h *Routes) Generate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var req model.GenerateRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxGenerateBodyBytes))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Input == "" {
		http.Error(w, "input is required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 90*time.Second)
	defer cancel()

	result, err := h.Gen.Generate(ctx, req.Input)
	if err != nil {
		log.Printf("generate error: %v", err)
		http.Error(w, "generation failed", http.StatusBadGateway)
		return
	}

	if err := json.NewEncoder(w).Encode(result); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
