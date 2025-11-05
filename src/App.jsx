import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Orders from "./pages/Orders";
import Recipe from "./pages/Recipe";
import Products from "./pages/Products";

function App() {
  return (
    <>
      <Header />

      <div className="container">
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/recipe" element={<Recipe />} />
        </Routes>
      </div>

    </>
  );
}

export default App;
