package models

type Utilisateur struct {
    NomUtilisateur string `json:"nom_u"`
    Email          string `json:"email"`
    MotDePasse     string `json:"mot_de_passe"`
}