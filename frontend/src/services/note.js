import { getValidToken } from "../utils/auth";


export async function getNote(tmdb_id) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch(`http://localhost:8080/notes?tmdb_id=${tmdb_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(message || "Erreur lors de la récupération de la note");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function ajouterNote(tmdb_id, score) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tmdb_id,
      score,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur lors de l'ajout de la note");
  }

  return response.json();
}

export async function modifierNote(tmdb_id, score) {
  const token = getValidToken();

  if (!token) {
    throw new Error("Session expirée");
  }

  const response = await fetch("http://localhost:8080/notes", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tmdb_id,
      score,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erreur lors de la modification de la note");
  }

  return response.json();
}