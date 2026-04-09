package handlers

import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
)

func GetFilmsTendance(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    // 1. Appel à l'API TMDB
    url := fmt.Sprintf(
        "%strending/movie/day?api_key=%s&language=fr-FR",
        os.Getenv("TMDB_API_URL"),os.Getenv("TMDB_API_KEY"),
    )
    
    resp, err := http.Get(url)
    if err != nil {
		fmt.Println(err)
        http.Error(w, "Erreur appel TMDB", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    // 2. Décoder la réponse TMDB
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    // 3. Renvoyer au client
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}

func RechercherFilms(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    // 1. Récupérer le paramètre de recherche
    query := r.URL.Query().Get("q")
    if query == "" {
        http.Error(w, "Paramètre 'q' manquant", http.StatusBadRequest)
        return
    }

    // 2. Appel à l'API TMDB
    url := fmt.Sprintf(
        "%ssearch/movie?api_key=%s&query=%s&language=fr-FR",
        os.Getenv("TMDB_API_URL"),os.Getenv("TMDB_API_KEY"), query,
    )

    resp, err := http.Get(url)
    if err != nil {
        http.Error(w, "Erreur appel TMDB", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    // 3. Décoder et renvoyer
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}

func GetFilmById(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    // 1. Récupérer l'id depuis l'URL
    id := r.URL.Query().Get("id")
    if id == "" {
        http.Error(w, "Paramètre 'id' manquant", http.StatusBadRequest)
        return
    }

    // 2. Appel TMDB
    // url := fmt.Sprintf(
    //     "%smovie/%s?api_key=%s&language=fr-FR",
    //     os.Getenv("TMDB_API_URL"),id, os.Getenv("TMDB_API_KEY"),
    // )
     url := fmt.Sprintf(
        "%smovie/%s?api_key=%s&language=fr-FR",
        os.Getenv("TMDB_API_URL"),id, os.Getenv("TMDB_API_KEY"),
    )

    resp, err := http.Get(url)
    if err != nil {
        http.Error(w, "Erreur appel TMDB", http.StatusInternalServerError)
        return
    }
    defer resp.Body.Close()

    // 3. Décoder et renvoyer
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}