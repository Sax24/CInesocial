package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "time"
    "fmt"
    "github.com/golang-jwt/jwt/v4"
    "golang.org/x/crypto/bcrypt"
    "cinesocial/models"
    "os"
)

func Login(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    // 1. Lire le body
    var u models.Utilisateur
    err := json.NewDecoder(r.Body).Decode(&u)
    if err != nil {
        http.Error(w, "JSON invalide", http.StatusBadRequest)
        return
    }

    // 2. Chercher l'utilisateur en BDD par email
    var utilisateurBDD models.Utilisateur
    err = db.QueryRow(
        "SELECT id, nom_u, mot_de_passe FROM utilisateurs WHERE email = $1",
        u.Email,
    ).Scan(&utilisateurBDD.Id, &utilisateurBDD.NomUtilisateur, &utilisateurBDD.MotDePasse)
    if err != nil {
        http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
        return
    }

    // 3. Vérifier le mot de passe
    err = bcrypt.CompareHashAndPassword([]byte(utilisateurBDD.MotDePasse), []byte(u.MotDePasse))
    if err != nil {
        http.Error(w, "Email ou mot de passe incorrect", http.StatusUnauthorized)
        return
    }

    // 4. Générer le token JWT
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": utilisateurBDD.Id,
        "nom_u":   utilisateurBDD.NomUtilisateur,
        "exp":     time.Now().Add(24 * time.Hour).Unix(),
    })

    tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        fmt.Println("Erreur génération token :", err)
        http.Error(w, "Erreur serveur", http.StatusInternalServerError)
        return
    }

    // 5. Renvoyer le token
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "token": tokenString,
    })
}