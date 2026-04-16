import { useEffect, useState } from "react";
import { getNote, ajouterNote, modifierNote } from "../../services/note";

export default function FilmNote({ filmId }) {
  const [noteUtilisateur, setNoteUtilisateur] = useState(0);
  const [savingNote, setSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchNote() {
      try {
        setErreur("");
        setNoteMessage("");

        const noteResponse = await getNote(filmId);

        if (!ignore) {
          setNoteUtilisateur(
            noteResponse?.has_note ? Number(noteResponse.score) : 0
          );
        }
      } catch (error) {
        if (!ignore) {
          setErreur(error.message || "Erreur lors du chargement de la note");
        }
      }
    }

    if (filmId) {
      fetchNote();
    }

    return () => {
      ignore = true;
    };
  }, [filmId]);

  const handleNoteClick = async (score) => {
    try {
      setSavingNote(true);
      setErreur("");
      setNoteMessage("");

      try {
        await ajouterNote(Number(filmId), score);
        setNoteMessage("Note ajoutée avec succès");
      } catch (error) {
        if (error.status === 409 || error.message?.includes("déjà noté")) {
          await modifierNote(Number(filmId), score);
          setNoteMessage("Note modifiée avec succès");
        } else {
          throw error;
        }
      }

      setNoteUtilisateur(score);
    } catch (error) {
      setErreur(error.message || "Erreur lors de l'enregistrement de la note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
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
            {noteUtilisateur > 0 ? `${noteUtilisateur}/5` : "Pas encore noté"}
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

      {erreur && <p className="mt-2 text-sm text-red-500">{erreur}</p>}
    </div>
  );
}