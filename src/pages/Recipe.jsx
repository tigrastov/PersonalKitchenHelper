import { useState, useEffect } from "react";
import "./Recipe.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Recipe() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);

  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("salad");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("");

  const [productSearch, setProductSearch] = useState("");


  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const recipesRef = collection(db, "recipes");
  const productsRef = collection(db, "products");

  // загрузка рецептов и продуктов
  const load = async () => {
    const snapRecipes = await getDocs(recipesRef);
    const snapProducts = await getDocs(productsRef);

    setProducts(snapProducts.docs.map((d) => ({ id: d.id, ...d.data() })));
    setRecipes(snapRecipes.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!recipeName.trim()) return;

    await addDoc(recipesRef, { name: recipeName, category, ingredients: [] });
    setRecipeName("");
    load();
  };

  const handleAddIngredient = async (recipeId) => {
    if (!selectedProduct || !qty) return;

    const recipeDoc = doc(db, "recipes", recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);

    const newIngredients = [
      ...recipe.ingredients,
      { productId: selectedProduct, qty: Number(qty) },
    ];

    await updateDoc(recipeDoc, { ingredients: newIngredients });

    setSelectedProduct("");
    setQty("");
    load();
  };

  const handleUpdateQty = async (recipeId, index, value) => {
    const recipeDoc = doc(db, "recipes", recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);

    const updated = recipe.ingredients.map((ing, i) =>
      i === index ? { ...ing, qty: Number(value) } : ing
    );

    await updateDoc(recipeDoc, { ingredients: updated });
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, ingredients: updated } : r))
    );
  };

  const handleDeleteIngredient = async (recipeId, index) => {
    const recipeDoc = doc(db, "recipes", recipeId);
    const recipe = recipes.find((r) => r.id === recipeId);

    const updated = recipe.ingredients.filter((_, i) => i !== index);

    await updateDoc(recipeDoc, { ingredients: updated });
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, ingredients: updated } : r))
    );
  };

  const handleDeleteRecipe = async (recipeId) => {
    await deleteDoc(doc(db, "recipes", recipeId));
    load();
  };

  const findProduct = (id) => products.find((p) => p.id === id);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );


  const categoryLabel = (c) => {
    switch (c) {
      case "salad":
        return "Салат";
      case "hot":
        return "Горячее";
      case "snack":
        return "Закуска";
      case "drink":
        return "Напиток";
      case "dessert":
        return "Десерт";
      case "other":
        return "Другое";
      default:
        return c;
    }
  };

  const unitLabel = (u) => {
    switch (u) {
      case "kg": return "кг";
      case "pcs": return "шт";
      case "l": return "л";
      default: return "";
    }
  };

  const filtered = recipes
    .filter((r) => (filter === "all" ? true : r.category === filter))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="recipes-page">
      <h1>Recipes</h1>

      {/* Поиск */}
      <input
        className="search-input"
        type="text"
        placeholder="Поиск рецепта..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Фильтр по категориям */}
      <div className="category-filter">
        {[
          ["all", "Все"],
          ["salad", "Салаты"],
          ["hot", "Горячее"],
          ["snack", "Закуски"],
          ["drink", "Напитки"],
          ["dessert", "Десерты"],
          ["other", "Другое"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Создание блюда */}
      <form className="recipe-form" onSubmit={handleCreateRecipe}>
        <h>Новое блюдо</h>
        <input
          type="text"
          placeholder="Название блюда"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="salad">Салаты</option>
          <option value="hot">Горячее</option>
          <option value="snack">Закуски</option>
          <option value="drink">Напитки</option>
          <option value="dessert">Десерты</option>
          <option value="other">Другое</option>
        </select>

        <button unit="submit">Создать</button>
      </form>

      {/* Список блюд */}
      <div className="recipes-list">
        {filtered.map((r) => (
          <div className="recipe-card" key={r.id}>
            <h3>
              {r.name} <span>({categoryLabel(r.category)})</span>
            </h3>

            {/* Добавление ингредиента */}
            <div className="ingredient-add">
              <input
                type="text"
                className="product-search"
                placeholder="Поиск продукта..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Выбрать продукт</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({unitLabel(p.unit)})
                  </option>
                ))}
              </select>


              <input
                type="number"
                step="0.01"
                placeholder="Кол-во"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <span className="unit-label">
                {selectedProduct
                  ? unitLabel(findProduct(selectedProduct)?.unit)
                  : ""}
              </span>

              <button onClick={() => handleAddIngredient(r.id)}>Добавить</button>
            </div>

            {/* Список ингредиентов */}
            <ul className="ingredients-list">
              {r.ingredients.map((ing, i) => {
                const prod = findProduct(ing.productId);
                return (
                  <li key={i}>
                    {prod ? prod.name : "???"} —{" "}
                    <input
                      type="number"
                      step="0.01"
                      value={ing.qty}
                      onChange={(e) =>
                        handleUpdateQty(r.id, i, e.target.value)
                      }
                    />
                    <span className="unit-label">
                      {prod ? unitLabel(prod.unit) : ""}
                    </span>

                    <button onClick={() => handleDeleteIngredient(r.id, i)}>
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              className="delete-recipe"
              onClick={() => handleDeleteRecipe(r.id)}
            >
              Удалить блюдо
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recipe;
