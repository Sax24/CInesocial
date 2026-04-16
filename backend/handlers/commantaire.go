package handlers

import (
	"cinesocial/models"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Ajouter un commentaire principal
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

	var body models.AjouterCommentaireRequest
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
		`INSERT INTO commentaires (utilisateur_id, tmdb_id, contenu, parent_commentaire_id)
		 VALUES ($1, $2, $3, NULL)
		 RETURNING id`,
		userID, body.TmdbID, body.Contenu,
	).Scan(&commentaireID)

	if err != nil {
		http.Error(w, "Erreur lors de l'ajout du commentaire", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Commentaire ajouté avec succès",
		"commentaire_id": commentaireID,
		"tmdb_id":        body.TmdbID,
		"contenu":        body.Contenu,
	})
}

// Ajouter une réponse à un commentaire principal
func AjouterReponseCommentaire(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	var body models.AjouterReponseCommentaireRequest
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

	if body.ParentCommentaireID <= 0 {
		http.Error(w, "parent_commentaire_id invalide", http.StatusBadRequest)
		return
	}

	if body.Contenu == "" {
		http.Error(w, "La réponse ne peut pas être vide", http.StatusBadRequest)
		return
	}

	var parentTmdbID int
	var parentParentID sql.NullInt64

	err = db.QueryRow(
		`SELECT tmdb_id, parent_commentaire_id
		 FROM commentaires
		 WHERE id = $1`,
		body.ParentCommentaireID,
	).Scan(&parentTmdbID, &parentParentID)

	if err == sql.ErrNoRows {
		http.Error(w, "Commentaire parent introuvable", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Erreur lors de la vérification du commentaire parent", http.StatusInternalServerError)
		return
	}

	if parentTmdbID != body.TmdbID {
		http.Error(w, "Le commentaire parent n'appartient pas à ce film", http.StatusBadRequest)
		return
	}

	// On limite à un seul niveau de réponse
	if parentParentID.Valid {
		http.Error(w, "Impossible de répondre à une réponse", http.StatusBadRequest)
		return
	}

	var reponseID int
	err = db.QueryRow(
		`INSERT INTO commentaires (utilisateur_id, tmdb_id, contenu, parent_commentaire_id)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id`,
		userID, body.TmdbID, body.Contenu, body.ParentCommentaireID,
	).Scan(&reponseID)

	if err != nil {
		http.Error(w, "Erreur lors de l'ajout de la réponse", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":               "Réponse ajoutée avec succès",
		"commentaire_id":        reponseID,
		"tmdb_id":               body.TmdbID,
		"parent_commentaire_id": body.ParentCommentaireID,
		"contenu":               body.Contenu,
	})
}

// Liker / enlever le like d'un commentaire
func ToggleReactionCommentaire(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	userID, err := getUserIDFromContext(r)
	if err != nil {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	var body models.ToggleReactionCommentaireRequest
	err = json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON invalide", http.StatusBadRequest)
		return
	}

	if body.CommentaireID <= 0 {
		http.Error(w, "commentaire_id invalide", http.StatusBadRequest)
		return
	}

	var commentaireExiste bool
	err = db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM commentaires WHERE id = $1)`,
		body.CommentaireID,
	).Scan(&commentaireExiste)
	if err != nil {
		http.Error(w, "Erreur lors de la vérification du commentaire", http.StatusInternalServerError)
		return
	}
	if !commentaireExiste {
		http.Error(w, "Commentaire introuvable", http.StatusNotFound)
		return
	}

	var deletedID int
	err = db.QueryRow(
		`DELETE FROM likes_commentaires
		 WHERE utilisateur_id = $1 AND commentaire_id = $2
		 RETURNING id`,
		userID, body.CommentaireID,
	).Scan(&deletedID)

	liked := false

	if err == sql.ErrNoRows {
		_, err = db.Exec(
			`INSERT INTO likes_commentaires (utilisateur_id, commentaire_id)
			 VALUES ($1, $2)`,
			userID, body.CommentaireID,
		)
		if err != nil {
			http.Error(w, "Erreur lors de l'ajout de la réaction", http.StatusInternalServerError)
			return
		}
		liked = true
	} else if err != nil {
		http.Error(w, "Erreur lors de la suppression de la réaction", http.StatusInternalServerError)
		return
	}

	var likesCount int
	err = db.QueryRow(
		`SELECT COUNT(*) FROM likes_commentaires WHERE commentaire_id = $1`,
		body.CommentaireID,
	).Scan(&likesCount)
	if err != nil {
		http.Error(w, "Erreur lors du comptage des réactions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"liked":          liked,
		"likes":          likesCount,
		"commentaire_id": body.CommentaireID,
	})
}

// Récupérer les commentaires d'un film avec réponses + likes
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
			c.utilisateur_id,
			c.parent_commentaire_id,
			COUNT(lc.id) AS likes,
			EXISTS (
				SELECT 1
				FROM likes_commentaires l2
				WHERE l2.commentaire_id = c.id AND l2.utilisateur_id = $2
			) AS a_like
		FROM commentaires c
		JOIN utilisateurs u ON u.id = c.utilisateur_id
		LEFT JOIN likes_commentaires lc ON lc.commentaire_id = c.id
		WHERE c.tmdb_id = $1
		GROUP BY c.id, c.contenu, c.cree_le, u.nom_u, c.utilisateur_id, c.parent_commentaire_id
		ORDER BY c.cree_le ASC
	`, tmdbID, userID)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des commentaires", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type commentaireDB struct {
		ID                  int
		User                string
		Texte               string
		CreeLe              time.Time
		Likes               int
		ALike               bool
		EstAuteur           bool
		ParentCommentaireID sql.NullInt64
	}

	var commentsDB []commentaireDB

	for rows.Next() {
		var c commentaireDB
		var auteurID int

		err := rows.Scan(
			&c.ID,
			&c.Texte,
			&c.CreeLe,
			&c.User,
			&auteurID,
			&c.ParentCommentaireID,
			&c.Likes,
			&c.ALike,
		)
		if err != nil {
			http.Error(w, "Erreur lors de la lecture des commentaires", http.StatusInternalServerError)
			return
		}

		c.EstAuteur = auteurID == userID
		commentsDB = append(commentsDB, c)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, "Erreur lors de la lecture des commentaires", http.StatusInternalServerError)
		return
	}

	nodes := make(map[int]*models.CommentaireResponse)

	for _, c := range commentsDB {
		var parentID *int
		if c.ParentCommentaireID.Valid {
			v := int(c.ParentCommentaireID.Int64)
			parentID = &v
		}

		nodes[c.ID] = &models.CommentaireResponse{
			ID:                  c.ID,
			User:                c.User,
			Texte:               c.Texte,
			CreeLe:              c.CreeLe.Format(time.RFC3339),
			Likes:               c.Likes,
			ALike:               c.ALike,
			EstAuteur:           c.EstAuteur,
			ParentCommentaireID: parentID,
			Reponses:            []*models.CommentaireResponse{},
		}
	}

	var racines []*models.CommentaireResponse

	for _, c := range commentsDB {
		node := nodes[c.ID]

		if c.ParentCommentaireID.Valid {
			parentID := int(c.ParentCommentaireID.Int64)
			parentNode, ok := nodes[parentID]
			if ok {
				parentNode.Reponses = append(parentNode.Reponses, node)
			}
		} else {
			racines = append(racines, node)
		}
	}

	if racines == nil {
		racines = []*models.CommentaireResponse{}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(racines)
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
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Commentaire supprimé avec succès",
	})
}