import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register1";
import Login2 from "./pages/Login2";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
     <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login2 />} />
         <Route path="/accueil" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;