import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicProfil,
  getPublicCommentaires,
} from "../services/publicProfil";

export default function ProfilPublic() {
  const { nom_u } = useParams();

  const [profil, setProfil] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        setLoading(true);
        setErreur("");

        const [profilData, commentairesData] = await Promise.all([
          getPublicProfil(nom_u),
          getPublicCommentaires(nom_u),
        ]);

        if (!ignore) {
          setProfil(profilData);
          setCommentaires(commentairesData);
        }
      } catch (error) {
        if (!ignore) {
          setErreur(error.message || "Erreur lors du chargement du profil");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (nom_u) {
      fetchData();
    }

    return () => {
      ignore = true;
    };
  }, [nom_u]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date non disponible";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("fr-FR");
  };

  const formatTempsEcoule = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const heures = Math.floor(diffMs / (1000 * 60 * 60));
    const jours = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "à l’instant";
    if (minutes < 60) return `${minutes}min`;
    if (heures < 24) return `${heures}h`;
    if (jours < 7) return `${jours}j`;

    return date.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return <p className="p-6">Chargement du profil...</p>;
  }

  if (erreur) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  if (!profil) {
    return <p className="p-6 text-red-500">Profil introuvable.</p>;
  }

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700">
              {profil.nom_u?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profil.nom_u}</h1>
              <p className="mt-2 text-sm text-violet-600">
                Membre depuis {formatDate(profil.cree_le)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {profil.notes}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Commentaires</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {profil.commentaires}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Watchlist</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {profil.watchlist}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Derniers commentaires
          </h2>

          {commentaires.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun commentaire public disponible.
            </p>
          ) : (
            <div className="custom-scroll max-h-105 space-y-4 overflow-y-auto pr-1">
              {commentaires.map((commentaire) => (
                <div
                  key={commentaire.id}
                  className="rounded-2xl bg-gray-50 px-4 py-4 transition hover:bg-gray-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">
                      {commentaire.film}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatTempsEcoule(commentaire.date)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    “{commentaire.texte}”
                  </p>

                  <p className="mt-2 text-xs text-pink-500">
                    ❤️ {commentaire.likes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}