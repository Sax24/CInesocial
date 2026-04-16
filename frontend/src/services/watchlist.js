import { getValidToken} from "../utils/auth";
export async function getWatchlist() {
    const token = getValidToken();
  if (!token) {
    throw new Error("Session expirée");
  }
  
  const response = await fetch("http://localhost:8080/watchlist", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer la watchlist");
  }

  return response.json();
}

export async function updateWatchlistStatut(tmdbId, statut) {
    const token = getValidToken();
  if (!token) {
    throw new Error("Session expirée");
  }


  const response = await fetch("http://localhost:8080/watchlist", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({tmdb_id: tmdbId, statut }),
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer la watchlist");
  }

  return response.json();
}

export async function addWatchlist(tmdbId) {
    const token = getValidToken();
  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({tmdb_id: parseInt(tmdbId)}),
  });
  console.log("RESPONSE :", response)
  if (!response.ok) {
    throw new Error("Impossible d'ajouter dans watchlist");
  }

  return response.json();
}

export async function deleteWatchlist(tmdbId) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:8080/watchlist?tmdb_id=${tmdbId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Impossible de supprimer le film de la watchlist");
  }
  // Si le backend renvoie 204 No Content
  if (response.status === 204) {
    return null;
  }
  // Si jamais il renvoie du JSON
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

