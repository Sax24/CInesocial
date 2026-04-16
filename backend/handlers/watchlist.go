package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
)

// Ajouter un film à la watchlist
func AjouterWatchlist(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer user_id depuis le contexte JWT
	userID := r.Context().Value("user_id")

	var body struct {
		TmdbID int `json:"tmdb_id"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil || body.TmdbID == 0 {
		http.Error(w, "tmdb_id manquant", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"INSERT INTO liste_a_voir (utilisateur_id, tmdb_id) VALUES ($1, $2)",
		userID, body.TmdbID,
	)
	if err != nil {
		http.Error(w, "Film déjà dans la liste ou erreur insertion", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Film ajouté à la watchlist"})
}

// Modifier le statut d'un film
func ModifierStatutWatchlist(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("user_id")

	var body struct {
		TmdbID int    `json:"tmdb_id"`
		Statut string `json:"statut"`
	}
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	// Vérifier que le statut est valide
	statutsValides := map[string]bool{"a_voir": true, "en_cours": true, "vu": true}
	if !statutsValides[body.Statut] {
		http.Error(w, "Statut invalide", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"UPDATE liste_a_voir SET statut = $1 WHERE utilisateur_id = $2 AND tmdb_id = $3",
		body.Statut, userID, body.TmdbID,
	)
	if err != nil {
		http.Error(w, "Erreur mise à jour", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Statut mis à jour"})
}

// Supprimer un film de la watchlist
func SupprimerWatchlist(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("user_id")

	tmdbID, err := strconv.Atoi(r.URL.Query().Get("tmdb_id"))
	if err != nil || tmdbID == 0 {
		http.Error(w, "tmdb_id manquant ou invalide", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(
		"DELETE FROM liste_a_voir WHERE utilisateur_id = $1 AND tmdb_id = $2",
		userID, tmdbID,
	)
	if err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Film supprimé de la watchlist"})
}

// Récupérer la watchlist de l'utilisateur connecté
func GetWatchlist(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("user_id")

	rows, err := db.Query(
		"SELECT tmdb_id, statut, ajoute_le FROM liste_a_voir WHERE utilisateur_id = $1 ORDER BY ajoute_le DESC",
		userID,
	)
	if err != nil {
		http.Error(w, "Erreur récupération", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var liste []map[string]interface{}
	for rows.Next() {
		var tmdbID int
		var statut, ajouteLe string
		rows.Scan(&tmdbID, &statut, &ajouteLe)
		liste = append(liste, map[string]interface{}{
			"tmdb_id":   tmdbID,
			"statut":    statut,
			"ajoute_le": ajouteLe,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(liste)
}