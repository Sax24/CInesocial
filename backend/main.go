package main

import (
	"fmt"
	"net/http"

	"cinesocial/db"
	"cinesocial/handlers"
	"cinesocial/middleware"
	"github.com/joho/godotenv"
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
		handlers.RechercherFilms(w, r)
	})

	fmt.Println("Serveur démarré sur : http://localhost:8080")
	err = http.ListenAndServe(":8080", middleware.CORSMiddleware(http.DefaultServeMux))
	if err != nil {
		fmt.Println("Erreur serveur :", err)
	}
}