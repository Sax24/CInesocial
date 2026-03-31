package middleware

import (
    "context"
    "net/http"
    "os"
    "strings"
    "github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {

        // 1. Lire le header Authorization
        authHeader :=r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Token manquant", http.StatusUnauthorized)
            return
        }

        // 2. Extraire le token (enlever "Bearer ")
        tokenString :=strings.TrimPrefix(authHeader, "Bearer ")

        // 3. Vérifier et décoder le token
        token, err :=jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        })
        if err != nil || !token.Valid {
            http.Error(w, "Token invalide", http.StatusUnauthorized)
            return
        }

        // 4. Extraire le user_id et l'ajouter au contexte
        claims := token.Claims.(jwt.MapClaims)
        ctx := context.WithValue(r.Context(), "user_id", claims["user_id"])

        // 5. Passer au handler suivant
        next.ServeHTTP(w, r.WithContext(ctx))
    }
}