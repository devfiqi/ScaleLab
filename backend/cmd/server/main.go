/*
	Creates routes, registers routers and starts the HTTP server
*/

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"scalelab-backend/internal/ai"
	"scalelab-backend/internal/handlers"
	"scalelab-backend/internal/middleware"
)

// corsMiddleware restricts cross-origin access.
// CORS_ORIGIN env var sets allowed origin (default: http://localhost:3000).
func corsMiddleware(next http.Handler) http.Handler {
	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "http://localhost:3000"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqOrigin := r.Header.Get("Origin")
		if reqOrigin != "" && matchOrigin(reqOrigin, origin) {
			w.Header().Set("Access-Control-Allow-Origin", reqOrigin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "3600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func matchOrigin(reqOrigin, allowed string) bool {
	for _, o := range strings.Split(allowed, ",") {
		if strings.TrimSpace(o) == reqOrigin {
			return true
		}
	}
	return false
}

func main() {
	ctx := context.Background()
	gen, err := ai.NewFromEnv(ctx)
	if err != nil {
		log.Fatal(err)
	}

	routes := &handlers.Routes{Gen: gen}

	switch gen.(type) {
	case ai.Stub:
		log.Println("design generator: stub (set OPENAI_API_KEY or GEMINI_API_KEY to use AI)")
	case *ai.OpenAI:
		log.Println("design generator: openai")
	case *ai.Gemini:
		log.Println("design generator: gemini")
	}

	limiter := middleware.NewRateLimiter()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", handlers.HealthHandler)
	mux.HandleFunc("/generate", routes.Generate)

	log.Println("server running on :8080")

	handler := corsMiddleware(limiter.Middleware(mux))
	err = http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal(err)
	}
}
