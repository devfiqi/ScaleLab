/*
	Creates routes, registers routers and starts the HTTP server
*/

package main

import (
	"log"
	"net/http"

	"scalelab-backend/internal/handlers"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", handlers.HealthHandler)
	mux.HandleFunc("/generate", handlers.GenerateHandler)

	log.Println("server running on :8080")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}
