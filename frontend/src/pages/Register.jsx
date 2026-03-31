import { useState } from "react";
import { register } from "../services/auth";

export default function Register() {
    const [formData, setFormData] = useState({
        nom_u: "",
        email: "",
        mot_de_passe: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await register(formData);
        if (response.ok) {
            window.location.href = "/login";
        } else {
            alert("Erreur lors de l'inscription");
        }

    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="mx-auto h-10 w-auto" />
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Bienvenue sur CineSocial</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="nom_u" className="block text-sm/6 font-medium text-gray-100">Nom</label>
                        </div>
                        <div className="mt-2">
                            <input id="nom_u"
                                type="nom_u"
                                name="nom_u" required
                                autoComplete="nom_u"
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                onChange={handleChange}
                                value={formData.nom_u}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-100">Adresse email</label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                onChange={handleChange}
                                value={formData.email}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="mot_de_passe" className="block text-sm/6 font-medium text-gray-100">Mot de passe</label>

                        </div>
                        <div className="mt-2">
                            <input
                                id="mot_de_passe"
                                type="password"
                                name="mot_de_passe"
                                required
                                autoComplete="current-password"
                                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                onChange={handleChange}
                                value={formData.mot_de_passe}
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">S'inscrire</button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm/6 text-gray-400 flex justify-between">
                    Déjà un compte?
                    <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">Se connecter</a>
                </p>
            </div>
        </div>

    );
}