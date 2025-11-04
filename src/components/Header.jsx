import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <img src="/Logo.png" alt="App Logo" className="logo" />
        <nav>
          <ul className="nav-list">
            <li><Link to="/">Orders</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/recipe">Recipe</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
