package handlers

import (
	"cinesocial/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func CreerUtilisateur(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var u models.Utilisateur
	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	u.NomUtilisateur = strings.TrimSpace(u.NomUtilisateur)
	u.Email = strings.TrimSpace(u.Email)
	u.MotDePasse = strings.TrimSpace(u.MotDePasse)

	if u.NomUtilisateur == "" || u.Email == "" || u.MotDePasse == "" {
		http.Error(w, "Tous les champs sont obligatoires", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.MotDePasse), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Erreur hash mot de passe", http.StatusInternalServerError)
		return
	}

	_, err = db.Exec(
		"INSERT INTO utilisateurs (nom_u, email, mot_de_passe) VALUES ($1, $2, $3)",
		u.NomUtilisateur, u.Email, string(hashedPassword),
	)
	if err != nil {
		fmt.Println("Erreur insertion utilisateur :", err)

		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" {
				if pqErr.Constraint == "utilisateurs_nom_u_key" {
					http.Error(w, "Nom d'utilisateur déjà utilisé", http.StatusConflict)
					return
				}
				if pqErr.Constraint == "utilisateurs_email_key" {
					http.Error(w, "Email déjà utilisé", http.StatusConflict)
					return
				}
				http.Error(w, "Utilisateur déjà existant", http.StatusConflict)
				return
			}
		}

		http.Error(w, "Erreur insertion", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Utilisateur créé !",
	})
}

func GetUtilisateurs(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }
    rows, err := db.Query("SELECT id, nom_u, email,mot_de_passe,cree_le FROM utilisateurs")
    if err != nil {
        http.Error(w, "Erreur récupération", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var utilisateurs []models.Utilisateur
    for rows.Next() {
        var u models.Utilisateur
        rows.Scan(&u.Id, &u.NomUtilisateur, &u.Email,&u.MotDePasse,&u.Cree_le)
        utilisateurs = append(utilisateurs, u)
    }
    fmt.Println("USER : ", utilisateurs)
    // Renvoie en JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(utilisateurs)
}



