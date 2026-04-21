package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

type Activite struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	Auteur string `json:"auteur"`
	TmdbID int    `json:"tmdb_id,omitempty"`
	Note   int    `json:"note,omitempty"`
	Date   string `json:"date"`
}

func GetActivites(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query(`
		SELECT *
		FROM (
			SELECT
				CONCAT('note-', n.id) AS id,
				'note' AS type,
				u.nom_u AS auteur,
				n.tmdb_id,
				n.score AS note,
				n.cree_le AS date_activite
			FROM notes n
			JOIN utilisateurs u ON u.id = n.utilisateur_id

			UNION ALL

			SELECT
				CONCAT('commentaire-', c.id) AS id,
				'commentaire' AS type,
				u.nom_u AS auteur,
				c.tmdb_id,
				0 AS note,
				c.cree_le AS date_activite
			FROM commentaires c
			JOIN utilisateurs u ON u.id = c.utilisateur_id
			WHERE c.parent_commentaire_id IS NULL

			UNION ALL

			SELECT
				CONCAT('watchlist-', l.id) AS id,
				'watchlist' AS type,
				u.nom_u AS auteur,
				l.tmdb_id,
				0 AS note,
				l.ajoute_le AS date_activite
			FROM liste_a_voir l
			JOIN utilisateurs u ON u.id = l.utilisateur_id
		) activites
		ORDER BY date_activite DESC
		LIMIT 30
	`)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des activités", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var activites []Activite

	for rows.Next() {
		var a Activite
		var dateActivite time.Time

		err := rows.Scan(&a.ID, &a.Type, &a.Auteur, &a.TmdbID, &a.Note, &dateActivite)
		if err != nil {
			http.Error(w, "Erreur lors de la lecture des activités", http.StatusInternalServerError)
			return
		}

		a.Date = dateActivite.Format(time.RFC3339)
		activites = append(activites, a)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Erreur lors de la lecture des activités", http.StatusInternalServerError)
		return
	}

	if activites == nil {
		activites = []Activite{}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(activites)
}