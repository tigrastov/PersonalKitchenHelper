

import { useState, useEffect } from "react";
import "./Products.css";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

function Products() {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg"); // изменено: type → unit
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const productsRef = collection(db, "products");

  const loadProducts = async () => {
    const snap = await getDocs(productsRef);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    items.sort((a, b) => a.name.localeCompare(b.name));
    setProducts(items);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(productsRef, { name, unit });

    setName("");
    setUnit("kg");
    loadProducts();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatUnit = (u) => {
    switch (u) {
      case "kg": return "кг";
      case "pcs": return "шт";
      case "l": return "л";
      default: return u;
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <h1>Продукты</h1>

      <div className="search-form">
        <p>Поиск товара</p>
        <input
          className="search-input"
          type="text"
          placeholder="Поиск товара..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>



      <div className="add-product">
        <p>Добавать товар</p>

        <form className="add-product-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Название товара"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="kg">Весовой (кг)</option>
            <option value="pcs">Штучный (шт)</option>
            <option value="l">Литраж (л)</option>
          </select>

          <button type="submit">Добавить</button>
        </form>
      </div>


      <div className="products">
        <p>Список товаров</p>
      </div>
      <ul className="product-list">
        {filtered.map((p) => (
          <li key={p.id}>
            {p.name} — {formatUnit(p.unit)}
            <button onClick={() => handleDelete(p.id)} className="delete-btn">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Products;
