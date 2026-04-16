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
	http.HandleFunc("/films/detail", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetFilmById(w, r)
	})

	http.HandleFunc("/watchlist", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
			case http.MethodGet:
				handlers.GetWatchlist(database, w, r)
			case http.MethodPost:
				handlers.AjouterWatchlist(database, w, r)
			case http.MethodPut:
				handlers.ModifierStatutWatchlist(database, w, r)
			case http.MethodDelete:
				handlers.SupprimerWatchlist(database, w, r)
		}
	}))

	http.HandleFunc("/notes", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handlers.GetNote(database, w, r)
	case http.MethodPost:
		handlers.AjouterNote(database, w, r)
	case http.MethodPut:
		handlers.ModifierNote(database, w, r)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
}))

	fmt.Println("Serveur démarré sur : http://localhost:8080")
	err = http.ListenAndServe(":8080", middleware.CORSMiddleware(http.DefaultServeMux))
	if err != nil {
		fmt.Println("Erreur serveur :", err)
	}
}