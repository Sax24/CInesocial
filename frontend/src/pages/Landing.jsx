import Navbar from "../components/Navbar";
import Tendance from "../components/Tendance";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import Watchlist from "../components/Watchlist";
import Actualite from "../components/Actualite";
import Recherche from "../components/Recherche";

export default function Landing() {
    const [payload, setPayload] = useState();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setPayload(jwtDecode(token));
        console.log("PATHNAME: ",location.pathname  )

    }, []);
    
     const contenu =
    location.pathname === "/watchlist" ? <Watchlist /> : ( location.pathname === "/actualites" ?  <Actualite />
    :(location.pathname === "/recherche" ? <Recherche /> :<Tendance />));

    return (
        <>
            <Navbar nomUser={payload?.nom_u} />
            {contenu}
        </>
    )
}