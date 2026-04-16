import { getFilmById } from "../services/films";
import { getWatchlist, addWatchlist } from "../services/watchlist";
import { getNote, ajouterNote, modifierNote } from "../services/note";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function FilmDetail() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [erreur, setErreur] = useState("");

  const [noteUtilisateur, setNoteUtilisateur] = useState(0);
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  const commentaires = [
    { id: 1, user: "Sarah", texte: "Super film !", likes: 4 },
    { id: 2, user: "Yanis", texte: "Décevant...", likes: 1 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setErreur("");
        setNoteMessage("");

        const [filmData, watchlistResponse, noteResponse] = await Promise.all([
          getFilmById(id),
          getWatchlist(),
          getNote(id),
        ]);

        setFilm(filmData);

        const watchlist = Array.isArray(watchlistResponse)? watchlistResponse : [];

        const dejaDansWatchlist = watchlist.some(
          (item) => Number(item.tmdb_id) === Number(id)
        );

        setIsAdded(dejaDansWatchlist);
        setNoteUtilisateur(noteResponse?.has_note ? Number(noteResponse.score) : 0);
      } catch (error) {
        setErreur(error.message || "Erreur lors du chargement du film");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleAjoutWatchlist = async () => {
    try {
      setAdding(true);
      setErreur("");

      await addWatchlist(Number(id));
      setIsAdded(true);
    } catch (error) {
      setErreur(error.message ||"Erreur lors de l'ajout du film");
    } finally {
      setAdding(false);
    }
  };

  const handleNoteClick = async (score) => {
    try {
      setSavingNote(true);
      setErreur("");
      setNoteMessage("");

      try {
        await ajouterNote(Number(id), score);
        setNoteMessage("Note ajoutée avec succès");
      } catch (error) {
        if (error.status === 409 || error.message?.includes("déjà noté")) {
          await modifierNote(Number(id), score);
          setNoteMessage("Note modifiée avec succès");
        } else {
          throw error;
        }
      }

      const noteResponse = await getNote(id);
      setNoteUtilisateur(noteResponse?.has_note ? Number(noteResponse.score) : 0);
    } catch (error) {
      setErreur(error.message || "Erreur lors de l'enregistrement de la note");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  if (erreur) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  if (!film) {
    return <p className="p-6 text-red-500">Film introuvable.</p>;
  }

  const noteSur5 = (film.vote_average / 2).toFixed(1);

  const renderStars = (note) => {
    const fullStars = Math.round(note / 2);
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={index < fullStars ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
          <div className="shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
              alt={film.title}
              className="h-80 w-56 rounded-2xl object-cover shadow-lg"
            />
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                {film.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {film.title}
              </h1>

              {film.tagline && (
                <p className="mt-2 text-sm italic text-violet-600">
                  {film.tagline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <span>Sortie : {film.release_date}</span>
                <span>Durée : {film.runtime} min</span>
                <span>Langue : {film.original_language?.toUpperCase()}</span>
                <span>Votes : {film.vote_count}</span>
              </div>

              <p className="mt-5 text-sm text-left leading-7 text-gray-600">
                {film.overview}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Note moyenne TMDB
                </span>
                <div className="flex text-xl">
                  {renderStars(film.vote_average)}
                </div>
                <span className="text-sm text-gray-500">({noteSur5}/5)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isAdded ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Déjà dans votre watchlist
                </div>
              ) : (
                <button
                  className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:bg-violet-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleAjoutWatchlist}
                  disabled={adding}
                >
                  {adding ? "Ajout en cours..." : "Ajouter à la watchlist"}
                </button>
              )}

              {film.homepage && (
                <a
                  href={film.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Voir le site officiel
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Votre note</h2>

            <div className="flex items-center gap-3">
              <div className="flex gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleNoteClick(score)}
                    disabled={savingNote}
                    className={`transition hover:scale-110 ${
                      score <= noteUtilisateur
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    } ${savingNote ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <span className="text-sm text-gray-500">
                {noteUtilisateur > 0
                  ? `${noteUtilisateur}/5`
                  : "Pas encore noté"}
              </span>
            </div>
          </div>

          {savingNote && (
            <p className="mt-2 text-sm text-gray-500">
              Enregistrement de la note...
            </p>
          )}

          {noteMessage && (
            <p className="mt-2 text-sm text-green-600">{noteMessage}</p>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-6 md:px-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Commentaires
          </h2>

          <div className="space-y-4">
            {commentaires.map((commentaire) => (
              <div
                key={commentaire.id}
                className="flex items-start justify-between rounded-2xl bg-gray-50 px-4 py-4 transition hover:bg-gray-100"
              >
                <div className="pr-4">
                  <p className="text-sm font-semibold text-gray-800">
                    {commentaire.user}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    “{commentaire.texte}”
                  </p>
                </div>

                <button className="flex items-center gap-1 rounded-full px-3 py-1 text-sm text-gray-500 transition hover:bg-white hover:text-pink-500">
                  <span>❤️</span>
                  <span>{commentaire.likes}</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm focus-within:border-violet-400">
            <textarea
              rows="4"
              placeholder="Écrire un commentaire..."
              className="w-full resize-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            <div className="mt-3 flex justify-end">
              <button className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black">
                Publier
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}