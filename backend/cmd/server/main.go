/*
	Creates routes, registers routers and starts the HTTP server
*/

package main

import (
	"log"
	"net/http"

	"scalelab-backend/internal/handlers"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", handlers.HealthHandler)
	mux.HandleFunc("/generate", handlers.GenerateHandler)

	log.Println("server running on :8080")

	err := http.ListenAndServe(":8080", corsMiddleware(mux))
	if err != nil {
		log.Fatal(err)
	}
}
