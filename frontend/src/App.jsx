
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register1";
import Login2 from "./pages/Login2";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import  ProtectedRoute from "./components/ProtectedRoute";
import  PublicRoute from "./components/PublicRoute";
import FilmDetail from "./pages/FilmDetail";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login2 />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/accueil" element={<Landing />} />
        </Route>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/film/details/:id" element={<FilmDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;