import "./style.css";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="container-navbar">
      <div className="logo-navbar">
        <h1 className="logo-nav">AudioExam</h1>
      </div>
      <div className="menu-navbar">
        <Link to="/" className="link-navbar">
          Inicio
        </Link>
        <Link to="/about" className="link-navbar">
          Sobre
        </Link>
      </div>
    </div>
  );
}
