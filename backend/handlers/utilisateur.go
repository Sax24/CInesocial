package handlers

import (
	"cinesocial/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func capitalizeFirstLetter(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}

	r, size := utf8.DecodeRuneInString(s)
	return string(unicode.ToUpper(r)) + s[size:]
}

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

	u.NomUtilisateur = capitalizeFirstLetter(u.NomUtilisateur)
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

func GetProfilPublic(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	nomU := r.URL.Query().Get("nom_u")
	if nomU == "" {
		http.Error(w, "nom_u manquant", http.StatusBadRequest)
		return
	}

	type ProfilPublic struct {
		NomU         string `json:"nom_u"`
		CreeLe       string `json:"cree_le"`
		Notes        int    `json:"notes"`
		Commentaires int    `json:"commentaires"`
		Watchlist    int    `json:"watchlist"`
	}

	var profil ProfilPublic
	var utilisateurID int
	var creeLe time.Time

	err := db.QueryRow(`
		SELECT id, nom_u, cree_le
		FROM utilisateurs
		WHERE nom_u = $1
	`, nomU).Scan(&utilisateurID, &profil.NomU, &creeLe)

	if err == sql.ErrNoRows {
		http.Error(w, "Utilisateur introuvable", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Erreur récupération profil", http.StatusInternalServerError)
		return
	}

	profil.CreeLe = creeLe.Format(time.RFC3339)

	_ = db.QueryRow(`SELECT COUNT(*) FROM notes WHERE utilisateur_id = $1`, utilisateurID).Scan(&profil.Notes)
	_ = db.QueryRow(`SELECT COUNT(*) FROM commentaires WHERE utilisateur_id = $1 AND parent_commentaire_id IS NULL`, utilisateurID).Scan(&profil.Commentaires)
	_ = db.QueryRow(`SELECT COUNT(*) FROM liste_a_voir WHERE utilisateur_id = $1`, utilisateurID).Scan(&profil.Watchlist)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(profil)
}



