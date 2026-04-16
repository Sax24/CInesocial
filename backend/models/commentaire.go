package models

type CommentaireResponse struct {
	ID                  int                  `json:"id"`
	User                string               `json:"user"`
	Texte               string               `json:"texte"`
	CreeLe              string               `json:"cree_le"`
	Likes               int                  `json:"likes"`
	ALike               bool                 `json:"a_like"`
	EstAuteur           bool                 `json:"est_auteur"`
	ParentCommentaireID *int                 `json:"parent_commentaire_id,omitempty"`
	Reponses            []*CommentaireResponse `json:"reponses,omitempty"`
}

type AjouterCommentaireRequest struct {
	TmdbID  int    `json:"tmdb_id"`
	Contenu string `json:"contenu"`
}

type AjouterReponseCommentaireRequest struct {
	TmdbID              int    `json:"tmdb_id"`
	ParentCommentaireID int    `json:"parent_commentaire_id"`
	Contenu             string `json:"contenu"`
}

type ToggleReactionCommentaireRequest struct {
	CommentaireID int `json:"commentaire_id"`
}