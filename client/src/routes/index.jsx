import { Route, BrowserRouter, Routes } from "react-router-dom";
import Navbar from "../components/navbar";
import Home from "../pages/home";
import About from "../pages/about";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
