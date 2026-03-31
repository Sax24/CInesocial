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

    http.HandleFunc("/utilisateurs", func(w http.ResponseWriter, r *http.Request) {
        handlers.CreerUtilisateur(database, w, r)
    })
    http.HandleFunc("/get/utilisateurs", func(w http.ResponseWriter, r *http.Request) {
        handlers.GetUtilisateurs(database, w, r)
    })

    http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
    handlers.Login(database, w, r)
    })

    http.HandleFunc("/films/tendances", func(w http.ResponseWriter, r *http.Request) {
    handlers.GetFilmsTendance(w, r)
    })

    http.HandleFunc("/films/recherche", func(w http.ResponseWriter, r *http.Request) {
    handlers.GetFilmsTendance(w, r)
    })

    //route protégé
    // http.HandleFunc("/commentaires", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
    // handlers.CreerCommentaire(database, w, r)
// }))
    fmt.Println("Serveur démarré sur : http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}