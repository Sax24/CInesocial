package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"
	"github.com/lib/pq"
)

// helper pour récupérer user_id depuis le contexte JWT
func getUserIDFromContext(r *http.Request) (int, error) {
	userID := r.Context().Value("user_id")
	if userID == nil {
		return 0, errors.New("user_id manquant dans le contexte")
	}

	switch v := userID.(type) {
	case float64:
		return int(v), nil
	case int:
		return v, nil
	case int64:
		return int(v), nil
	case string:
		return strconv.Atoi(v)
	default:
		return 0, errors.New("type de user_id invalide")
	}
}

// Ajouter une note
func AjouterNote(db *sql.DB, w http.ResponseWriter, r *http.Request) {
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
		TmdbID int `json:"tmdb_id"`
		Score  int `json:"score"`
	}

	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	if body.TmdbID == 0 {
		http.Error(w, "tmdb_id manquant", http.StatusBadRequest)
		return
	}

	if body.Score < 1 || body.Score > 5 {
		http.Error(w, "Le score doit être entre 1 et 5", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"INSERT INTO notes (utilisateur_id, tmdb_id, score) VALUES ($1, $2, $3)",
		userID, body.TmdbID, body.Score,
	)
	if err != nil {
		// Gestion du UNIQUE(utilisateur_id, tmdb_id)
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			http.Error(w, "Vous avez déjà noté ce film", http.StatusConflict)
			return
		}

		http.Error(w, "Erreur lors de l'ajout de la note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Note ajoutée avec succès",
	})
}

// Modifier une note existante
func ModifierNote(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	var body struct {
		TmdbID int `json:"tmdb_id"`
		Score  int `json:"score"`
	}

	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	if body.TmdbID == 0 {
		http.Error(w, "tmdb_id manquant", http.StatusBadRequest)
		return
	}

	if body.Score < 1 || body.Score > 5 {
		http.Error(w, "Le score doit être entre 1 et 5", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE notes SET score = $1 WHERE utilisateur_id = $2 AND tmdb_id = $3",
		body.Score, userID, body.TmdbID,
	)
	if err != nil {
		http.Error(w, "Erreur lors de la modification de la note", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Erreur lors de la vérification de la mise à jour", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Aucune note trouvée pour ce film", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Note modifiée avec succès",
	})
}

// Récupérer la note de l'utilisateur connecté pour un film
func GetNote(db *sql.DB, w http.ResponseWriter, r *http.Request) {
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

	var score int
	var creeLe time.Time

	err = db.QueryRow(
		"SELECT score, cree_le FROM notes WHERE utilisateur_id = $1 AND tmdb_id = $2",
		userID, tmdbID,
	).Scan(&score, &creeLe)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"tmdb_id":    tmdbID,
				"score":      0,
				"has_note":   false,
				"created_at": nil,
			})
			return
		}

		http.Error(w, "Erreur lors de la récupération de la note", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tmdb_id":    tmdbID,
		"score":      score,
		"has_note":   true,
		"created_at": creeLe,
	})
}