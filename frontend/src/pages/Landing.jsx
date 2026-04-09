import Navbar from "../components/Navbar";
import Tendance from "../components/Tendance";
import { useEffect,useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Landing() {
    const [payload ,setPayload] = useState();
    
    useEffect(()=>{
        const token = localStorage.getItem("token");
            setPayload(jwtDecode(token));

   },[]);
    return (
        <>
            <Navbar nomUser = {payload?.nom_u}/>
            <Tendance />
        </>
    )
}