/*
	Take an HTTP request, turn it into Go data, call the service, turn the result back into HTTP response
*/

package handlers

import (
	"encoding/json"
	"net/http"

	"scalelab-backend/internal/model"
	"scalelab-backend/internal/service"
)

func GenerateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var req model.GenerateRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Input == "" {
		http.Error(w, "input is required", http.StatusBadRequest)
		return
	}

	result := service.GenerateDesign(req.Input)

	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
