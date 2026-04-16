import { getFilmById } from "../services/films";
import { getWatchlist, addWatchlist } from "../services/watchlist";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FilmNote from "../components/film/FilmNote";
import FilmCommentaires from "../components/film/FilmCommentaires";

export default function FilmDetail() {
  const { id } = useParams();

  const [film, setFilm] = useState(null);
  const [loadingFilm, setLoadingFilm] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchFilm() {
      try {
        setLoadingFilm(true);
        setErreur("");
        setFilm(null);

        const filmData = await getFilmById(id);

        if (!ignore) {
          setFilm(filmData);
          setLoadingFilm(false);
        }
      } catch (error) {
        if (!ignore) {
          setErreur(error.message || "Erreur lors du chargement du film");
          setLoadingFilm(false);
        }
      }
    }

    async function fetchWatchlist() {
      try {
        const watchlistResponse = await getWatchlist();
        if (ignore) return;

        const watchlist = Array.isArray(watchlistResponse)
          ? watchlistResponse
          : [];

        const dejaDansWatchlist = watchlist.some(
          (item) => Number(item.tmdb_id) === Number(id)
        );

        setIsAdded(dejaDansWatchlist);
      } catch {
        // ne pas bloquer le rendu du film
      }
    }

    fetchFilm();
    fetchWatchlist();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAjoutWatchlist = async () => {
    try {
      setAdding(true);
      setErreur("");
      await addWatchlist(Number(id));
      setIsAdded(true);
    } catch (error) {
      setErreur(error.message || "Erreur lors de l'ajout du film");
    } finally {
      setAdding(false);
    }
  };

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

  if (loadingFilm) {
    return <p className="p-6">Chargement...</p>;
  }

  if (erreur && !film) {
    return <p className="p-6 text-red-500">{erreur}</p>;
  }

  if (!film) {
    return <p className="p-6 text-red-500">Film introuvable.</p>;
  }

  const noteSur5 = (film.vote_average / 2).toFixed(1);

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
                <div className="flex text-xl">{renderStars(film.vote_average)}</div>
                <span className="text-sm text-gray-500">({noteSur5}/5)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isAdded ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm">
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

        <FilmNote filmId={id} />
        <FilmCommentaires filmId={id} />
      </div>
    </section>
  );
}