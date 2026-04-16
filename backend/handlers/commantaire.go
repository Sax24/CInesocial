package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Ajouter un commentaire sur un film
func AjouterCommentaire(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	var body struct {
		TmdbID  int    `json:"tmdb_id"`
		Contenu string `json:"contenu"`
	}

	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	body.Contenu = strings.TrimSpace(body.Contenu)

	if body.TmdbID <= 0 {
		http.Error(w, "tmdb_id invalide", http.StatusBadRequest)
		return
	}

	if body.Contenu == "" {
		http.Error(w, "Le commentaire ne peut pas être vide", http.StatusBadRequest)
		return
	}

	var commentaireID int
	err = db.QueryRow(
		`INSERT INTO commentaires (utilisateur_id, tmdb_id, contenu)
		 VALUES ($1, $2, $3)
		 RETURNING id`,
		userID, body.TmdbID, body.Contenu,
	).Scan(&commentaireID)

	if err != nil {
		http.Error(w, "Erreur lors de l'ajout du commentaire", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":         "Commentaire ajouté avec succès",
		"commentaire_id":  commentaireID,
		"tmdb_id":         body.TmdbID,
		"contenu":         body.Contenu,
	})
}

// Supprimer un commentaire de l'utilisateur connecté
func SupprimerCommentaire(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	commentaireIDStr := r.URL.Query().Get("id")
	if commentaireIDStr == "" {
		http.Error(w, "id du commentaire manquant", http.StatusBadRequest)
		return
	}

	commentaireID, err := strconv.Atoi(commentaireIDStr)
	if err != nil || commentaireID <= 0 {
		http.Error(w, "id du commentaire invalide", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		`DELETE FROM commentaires
		 WHERE id = $1 AND utilisateur_id = $2`,
		commentaireID, userID,
	)
	if err != nil {
		http.Error(w, "Erreur lors de la suppression du commentaire", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Erreur lors de la vérification de la suppression", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Commentaire introuvable ou non autorisé", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Commentaire supprimé avec succès",
	})
}

func GetCommentairesFilm(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	tmdbIDStr := r.URL.Query().Get("tmdb_id")
	if tmdbIDStr == "" {
		http.Error(w, "tmdb_id manquant", http.StatusBadRequest)
		return
	}

	tmdbID, err := strconv.Atoi(tmdbIDStr)
	if err != nil || tmdbID <= 0 {
		http.Error(w, "tmdb_id invalide", http.StatusBadRequest)
		return
	}

	rows, err := db.Query(`
		SELECT 
			c.id,
			c.contenu,
			c.cree_le,
			u.nom_u,
			COUNT(lc.id) AS likes,
			CASE WHEN c.utilisateur_id = $2 THEN true ELSE false END AS est_auteur
		FROM commentaires c
		JOIN utilisateurs u ON u.id = c.utilisateur_id
		LEFT JOIN likes_commentaires lc ON lc.commentaire_id = c.id
		WHERE c.tmdb_id = $1
		GROUP BY c.id, c.contenu, c.cree_le, u.nom_u, c.utilisateur_id
		ORDER BY c.cree_le DESC
	`, tmdbID, userID)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des commentaires", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Commentaire struct {
		ID        int    `json:"id"`
		User      string `json:"user"`
		Texte     string `json:"texte"`
		CreeLe    string `json:"cree_le"`
		Likes     int    `json:"likes"`
		EstAuteur bool   `json:"est_auteur"`
	}

	var commentaires []Commentaire

	for rows.Next() {
		var c Commentaire
		var creeLe time.Time

		err := rows.Scan(&c.ID, &c.Texte, &creeLe, &c.User, &c.Likes, &c.EstAuteur)
		if err != nil {
			http.Error(w, "Erreur lors de la lecture des commentaires", http.StatusInternalServerError)
			return
		}

		c.CreeLe = creeLe.Format(time.RFC3339)
		commentaires = append(commentaires, c)
	}

	if commentaires == nil {
		commentaires = []Commentaire{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commentaires)
}