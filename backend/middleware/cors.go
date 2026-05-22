package middleware

import (
	"net/http"
	"os"
	"strings"
)

func CORSMiddleware(next http.Handler) http.Handler {
	frontendURL := os.Getenv("FRONTEND_URL")

	allowedOrigins := map[string]bool{
		"http://localhost:5173": true,
		frontendURL:            true,
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}