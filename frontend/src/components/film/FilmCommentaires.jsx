import { useEffect, useState } from "react";
import {
  getCommentairesByFilm,
  ajouterCommentaire,
  supprimerCommentaire,
  toggleReactionCommentaire,
  ajouterReponseCommentaire,
} from "../../services/commentaire";

export default function FilmCommentaires({ filmId }) {
  const [commentaires, setCommentaires] = useState([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const [commentaireLoading, setCommentaireLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchCommentaires() {
      try {
        setErreur("");
        const commentairesResponse = await getCommentairesByFilm(filmId);

        if (!ignore) {
          setCommentaires(
            Array.isArray(commentairesResponse) ? commentairesResponse : []
          );
        }
      } catch (error) {
        if (!ignore) {
          setErreur(
            error.message || "Erreur lors du chargement des commentaires"
          );
        }
      }
    }

    if (filmId) {
      fetchCommentaires();
    }

    return () => {
      ignore = true;
    };
  }, [filmId]);

  const refreshCommentaires = async () => {
    const commentairesMaj = await getCommentairesByFilm(filmId);
    setCommentaires(Array.isArray(commentairesMaj) ? commentairesMaj : []);
  };

  const handleAjouterCommentaire = async () => {
    try {
      if (!nouveauCommentaire.trim()) return;

      setCommentaireLoading(true);
      setErreur("");

      await ajouterCommentaire(Number(filmId), nouveauCommentaire.trim());
      await refreshCommentaires();
      setNouveauCommentaire("");
    } catch (error) {
      setErreur(error.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setCommentaireLoading(false);
    }
  };

  const handleSupprimerCommentaire = async (commentaireId) => {
    try {
      setErreur("");
      await supprimerCommentaire(commentaireId);
      await refreshCommentaires();
    } catch (error) {
      setErreur(error.message || "Erreur lors de la suppression du commentaire");
    }
  };

  const handleToggleReaction = async (commentaireId) => {
    try {
      setErreur("");

      const result = await toggleReactionCommentaire(commentaireId);

      setCommentaires((prev) =>
        prev.map((commentaire) => {
          if (commentaire.id === commentaireId) {
            return {
              ...commentaire,
              likes: result.likes,
              a_like: result.liked,
            };
          }

          return {
            ...commentaire,
            reponses: (commentaire.reponses || []).map((reponse) =>
              reponse.id === commentaireId
                ? {
                    ...reponse,
                    likes: result.likes,
                    a_like: result.liked,
                  }
                : reponse
            ),
          };
        })
      );
    } catch (error) {
      setErreur(error.message || "Erreur lors de la réaction");
    }
  };

  const handleToggleReply = (commentaireId) => {
    if (replyOpenId === commentaireId) {
      setReplyOpenId(null);
      setReplyText("");
      return;
    }

    setReplyOpenId(commentaireId);
    setReplyText("");
  };

  const handleAjouterReponse = async (parentCommentaireId) => {
    try {
      if (!replyText.trim()) return;

      setReplyLoading(true);
      setErreur("");

      await ajouterReponseCommentaire(
        Number(filmId),
        parentCommentaireId,
        replyText.trim()
      );

      await refreshCommentaires();
      setReplyOpenId(null);
      setReplyText("");
    } catch (error) {
      setErreur(error.message || "Erreur lors de l'ajout de la réponse");
    } finally {
      setReplyLoading(false);
    }
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

    return date.toLocaleDateString();
  };

  const DeleteButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600"
      title="Supprimer"
      aria-label="Supprimer le commentaire"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  );

  const ReactionButton = ({ commentaire }) => (
    <button
      onClick={() => handleToggleReaction(commentaire.id)}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition ${
        commentaire.a_like
          ? "bg-pink-50 text-pink-500 hover:bg-pink-100"
          : "text-gray-500 hover:bg-white hover:text-pink-500"
      }`}
    >
      <span>❤️</span>
      <span>{commentaire.likes ?? 0}</span>
    </button>
  );

  return (
    <div className="border-t border-gray-200 px-6 py-6 md:px-8">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Commentaires</h2>

      {erreur && <p className="mb-4 text-sm text-red-500">{erreur}</p>}

      <div className="max-h-105 space-y-4 overflow-y-auto pr-2">
        {commentaires.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun commentaire pour ce film.</p>
        ) : (
          commentaires.map((commentaire) => (
            <div key={commentaire.id} className="space-y-3">
              <div className="flex items-start justify-between rounded-2xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {commentaire.user}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatTempsEcoule(commentaire.cree_le)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-left text-gray-600">
                    “{commentaire.texte}”
                  </p>

                  <div className="mt-3">
                    <button
                      onClick={() => handleToggleReply(commentaire.id)}
                      className="text-sm font-medium text-violet-600 transition hover:text-violet-700"
                    >
                      Répondre
                    </button>
                  </div>

                  {replyOpenId === commentaire.id && (
                    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm">
                      <textarea
                        rows="2"
                        placeholder="Écrire une réponse..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full resize-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyOpenId(null);
                            setReplyText("");
                          }}
                          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          Annuler
                        </button>

                        <button
                          onClick={() => handleAjouterReponse(commentaire.id)}
                          disabled={replyLoading || !replyText.trim()}
                          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {replyLoading ? "Envoi..." : "Répondre"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center gap-2 self-start">
                  <ReactionButton commentaire={commentaire} />

                  {commentaire.est_auteur && (
                    <DeleteButton
                      onClick={() => handleSupprimerCommentaire(commentaire.id)}
                    />
                  )}
                </div>
              </div>

              {(commentaire.reponses || []).length > 0 && (
                <div className="ml-6 space-y-2 border-l border-gray-200 pl-3">
                  {commentaire.reponses.map((reponse) => (
                    <div
                      key={reponse.id}
                      className="flex items-start justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">
                            {reponse.user}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTempsEcoule(reponse.cree_le)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-left text-gray-600">
                          “{reponse.texte}”
                        </p>
                      </div>

                      <div className="ml-4 flex items-center gap-2 self-start">
                        <ReactionButton commentaire={reponse} />

                        {reponse.est_auteur && (
                          <DeleteButton
                            onClick={() => handleSupprimerCommentaire(reponse.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm focus-within:border-violet-400">
        <textarea
          rows="3"
          placeholder="Écrire un commentaire..."
          value={nouveauCommentaire}
          onChange={(e) => setNouveauCommentaire(e.target.value)}
          className="w-full resize-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleAjouterCommentaire}
            disabled={commentaireLoading || !nouveauCommentaire.trim()}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {commentaireLoading ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}