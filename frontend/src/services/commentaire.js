import { getValidToken } from "../utils/auth";

export async function getCommentairesByFilm(tmdb_id) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch(
    `http://localhost:8080/commentaires?tmdb_id=${tmdb_id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur lors de la récupération des commentaires");
  }

  return response.json();
}

export async function ajouterCommentaire(tmdb_id, contenu) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/commentaires", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tmdb_id,
      contenu,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur lors de l'ajout du commentaire");
  }

  return response.json();
}

export async function supprimerCommentaire(commentaireId) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch(
    `http://localhost:8080/commentaires?id=${commentaireId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur lors de la suppression du commentaire");
  }

  return response.json();
}