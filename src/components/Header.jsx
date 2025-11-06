import { NavLink } from "react-router-dom";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <img src="/Logo.png" alt="App Logo" className="logo" />

        <nav className="nav">
          <ul className="nav-list">
            <li><NavLink to="/">Заказы</NavLink></li>
            <li><NavLink to="/products">Продукты</NavLink></li>
            <li><NavLink to="/recipe">Рецепты</NavLink></li>
          </ul>
        </nav>

      </div>
    </header>


  );
}

export default Header;
