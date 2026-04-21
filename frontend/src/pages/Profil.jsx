import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfilData } from "../services/profil";
import { logout } from "../utils/auth";

export default function Profil() {
  const navigate = useNavigate();

  const [utilisateur, setUtilisateur] = useState(null);
  const [stats, setStats] = useState({
    notes: 0,
    commentaires: 0,
    watchlist: 0,
  });
  const [watchlist, setWatchlist] = useState([]);
  const [commentaires, setCommentaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchProfil() {
      try {
        setLoading(true);
        setErreur("");

        const data = await getProfilData();

        if (!ignore) {
          setUtilisateur(data.utilisateur);
          setStats(data.stats);
          setWatchlist(data.watchlist);
          setCommentaires(data.commentaires);
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

    fetchProfil();

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non disponible";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("fr-FR");
  };

  const getStatutLabel = (statut) => {
    if (statut === "a_voir") return "à voir";
    if (statut === "en_cours") return "en cours";
    if (statut === "vu") return "vu";
    return statut;
  };

  if (loading) {
    return <p className="p-6">Chargement du profil...</p>;
  }

  if (erreur) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  if (!utilisateur) {
    return <p className="p-6 text-red-500">Profil introuvable.</p>;
  }

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-3xl font-bold text-violet-700">
                {utilisateur.nom_u?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {utilisateur.nom_u}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{utilisateur.email}</p>
                <p className="mt-2 text-sm text-violet-600">
                  Membre depuis {formatDate(utilisateur.cree_le)}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Notes</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.notes}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Commentaires</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.commentaires}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Watchlist</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.watchlist}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Ma watchlist
            </h2>
          </div>

          {watchlist.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun film dans votre watchlist.
            </p>
          ) : (
            <div className="custom-scroll max-h-130 overflow-y-auto pr-1">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {watchlist.map((film) => (
                  <div
                    key={film.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition hover:shadow-md"
                  >
                    {film.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                        alt={film.title}
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-gray-200 text-sm text-gray-500">
                        Affiche indisponible
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{film.title}</h3>
                      <span className="mt-2 inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                        {getStatutLabel(film.statut)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Derniers commentaires
          </h2>

          {commentaires.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun commentaire disponible.
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
                      {commentaire.date}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    “{commentaire.texte}”
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