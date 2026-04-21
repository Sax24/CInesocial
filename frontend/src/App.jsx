
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register1";
import Login2 from "./pages/Login2";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import  ProtectedRoute from "./components/ProtectedRoute";
import  PublicRoute from "./components/PublicRoute";
import FilmDetail from "./pages/FilmDetail";
import Profil from "./pages/Profil";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login2 />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/accueil" element={<Landing />} />
          <Route path="/" element={<Navigate to="/accueil" />} />
          <Route path="/film/details/:id" element={<FilmDetail />} />
         <Route path="/watchlist" element={<Landing />} />
          <Route path="/actualites" element={<Landing />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/recherche" element={<Landing />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;