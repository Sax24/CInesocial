package main

import (
    "fmt"
    "net/http"
    "github.com/joho/godotenv"
    "cinesocial/db"
    "cinesocial/handlers"
)

func main() {
    godotenv.Load()

    database, err := db.Connect()
    if err != nil {
        fmt.Println("Erreur connexion :", err)
        return
    }
    defer database.Close()

    fmt.Println("Connecté à la base de données !")

    http.HandleFunc("/utilisateur", func(w http.ResponseWriter, r *http.Request) {
        handlers.CreerUtilisateur(database, w, r)
    })
    fmt.Println("Serveur démarré sur : http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}