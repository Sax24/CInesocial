export default function  formatTempsEcoule (dateString) {
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