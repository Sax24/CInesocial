package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "cinesocial/models"
	"fmt"
)

func CreerUtilisateur(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    var u models.Utilisateur
    json.NewDecoder(r.Body).Decode(&u)
	fmt.Println("Nom: ",u.NomUtilisateur)
	fmt.Println("u.Email: ",u.Email)
	fmt.Println("u.Email: ",u.MotDePasse)
    _, err := db.Exec(
        "INSERT INTO utilisateurs (nom_u, email, mot_de_passe) VALUES ($1, $2, $3)",
        u.NomUtilisateur, u.Email, u.MotDePasse,
    )
    if err != nil {
        http.Error(w, "Erreur insertion", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
}