package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "cinesocial/models"
    "golang.org/x/crypto/bcrypt"
    "fmt"
)

func CreerUtilisateur(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }
    var u models.Utilisateur
    json.NewDecoder(r.Body).Decode(&u)
    
    //Hash du mot de passe
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.MotDePasse), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Erreur hash mot de passe", http.StatusInternalServerError)
        return
    }
    fmt.Println("MDP : ", string(hashedPassword))
    _, err = db.Exec(
        "INSERT INTO utilisateurs (nom_u, email, mot_de_passe) VALUES ($1, $2, $3)",
        u.NomUtilisateur, u.Email, string(hashedPassword),
    )
    if err != nil {
        http.Error(w, "Erreur insertion", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"message": "Utilisateur créé !"})
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



