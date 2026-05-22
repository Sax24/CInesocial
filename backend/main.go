package main

import (
	"os"
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
	http.HandleFunc("/commentaires", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
			case http.MethodGet:
				handlers.GetCommentairesFilm(database, w, r)
			case http.MethodPost:
				handlers.AjouterCommentaire(database, w, r)
			case http.MethodDelete:
				handlers.SupprimerCommentaire(database, w, r)
			default:
				http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/commentaires/reponses", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
			case http.MethodPost:
				handlers.AjouterReponseCommentaire(database, w, r)
			default:
				http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/commentaires/reactions", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
			case http.MethodPost:
				handlers.ToggleReactionCommentaire(database, w, r)
			default:
				http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/profil/commentaires", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handlers.GetMesCommentaires(database, w, r)
	default:
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
	}
	}))
	http.HandleFunc("/profil/notes", middleware.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetMesNotes(database, w, r)
		default:
			http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		}
	}))

	http.HandleFunc("/utilisateurs/profil", func(w http.ResponseWriter, r *http.Request) {
    handlers.GetProfilPublic(database, w, r)
})

	http.HandleFunc("/utilisateurs/commentaires", func(w http.ResponseWriter, r *http.Request) {
		handlers.GetCommentairesUtilisateur(database, w, r)
	})

	http.HandleFunc("/activites", func(w http.ResponseWriter, r *http.Request) {
	handlers.GetActivites(database, w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Println("Serveur démarré sur : "+port)
	err = http.ListenAndServe(":"+port, middleware.CORSMiddleware(http.DefaultServeMux))


	if err != nil {
		fmt.Println("Erreur serveur :", err)
	}

}

