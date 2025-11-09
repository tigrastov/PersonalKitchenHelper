


import { useState, useEffect } from "react";
import "./Orders.css";
import { db } from "../firebase";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [addForm, setAddForm] = useState({});

  const ordersRef = collection(db, "orders");
  const recipesRef = collection(db, "recipes");
  const productsRef = collection(db, "products");

  const categoryLabel = (c) => {
    switch (c) {
      case "salad": return "Салат";
      case "hot": return "Горячее";
      case "snack": return "Закуска";
      case "drink": return "Напиток";
      case "dessert": return "Десерт";
      case "other": return "Другое";
      default: return c;
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

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU");
  }



  const loadAll = async () => {
    const oSnap = await getDocs(ordersRef);
    const rSnap = await getDocs(recipesRef);
    const pSnap = await getDocs(productsRef);

    const ordersList = oSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const recipesList = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const productsList = pSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // ✅ Сортировка по дате — новые сначала
    // ordersList.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    ordersList.sort((a, b) => new Date(a.date) - new Date(b.date));


    setOrders(ordersList);
    setRecipes(recipesList);
    setProducts(productsList);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !orderDate) return;

    await addDoc(ordersRef, { name, date: orderDate, items: [] });
    setName("");
    setOrderDate("");
    loadAll();
  };

  const updateAddForm = (orderId, field, value) => {
    setAddForm((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  const findRecipe = (id) => recipes.find((r) => r.id === id);

  const handleAddItem = async (orderId) => {
    const form = addForm[orderId];
    if (!form || !form.recipeId || !form.qty) return;

    const order = orders.find((o) => o.id === orderId);
    const updated = [...order.items, { recipeId: form.recipeId, qty: Number(form.qty) }];

    await updateDoc(doc(db, "orders", orderId), { items: updated });
    setAddForm((prev) => ({ ...prev, [orderId]: {} }));
    loadAll();
  };

  const handleUpdateQty = async (orderId, index, value) => {
    const order = orders.find((o) => o.id === orderId);
    const updated = [...order.items];
    updated[index].qty = Number(value);
    await updateDoc(doc(db, "orders", orderId), { items: updated });
    loadAll();
  };

  const handleDeleteItem = async (orderId, index) => {
    const order = orders.find((o) => o.id === orderId);
    const updated = order.items.filter((_, i) => i !== index);
    await updateDoc(doc(db, "orders", orderId), { items: updated });
    loadAll();
  };

  const handleDeleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const calculateProductsForOrder = (order) => {
    const result = {};

    order.items.forEach((item) => {
      const recipe = findRecipe(item.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach((ing) => {
        const product = products.find((p) => p.id === ing.productId);
        if (!product) return;

        const needed = ing.qty * item.qty;

        if (result[product.id]) {
          result[product.id].amount += needed;
        } else {
          result[product.id] = {
            name: product.name,
            unit: product.unit,
            amount: needed,
          };
        }
      });
    });

    return Object.values(result);
  };

  return (
    <div className="page">

      <h1>Заказы</h1>


      {/* Поиск по дате */}
      <div className="search-date-form">
        <p>Поиск заказа по дате</p>

        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="search-date-input"
        />

      </div>



      {/* Создание нового заказа */}
      <form className="order-form" onSubmit={handleCreate}>
        <label className="title-new-order">Создание нового заказа</label>
        <input type="date" value={orderDate} className="date-new-order" onChange={(e) => setOrderDate(e.target.value)} />
        <input className="name-new-order" type="text" placeholder="Название заказа" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-new-order" type="submit">+ Создать заказ</button>
      </form>

      <h2>Список заказов</h2>
      {/* Заказы */}
      <ul className="order-list">

        {orders
          .filter((o) => !searchDate || o.date === searchDate)
          .map((o) => (
            <li key={o.id} className="order-item">
              <div className="order-header">
                <strong className="order-name">{o.name}</strong>
                {/* <span className="order-date">({o.date})</span> */}
                <span className="order-date">({formatDate(o.date)})</span>

                <button className="delete-order-btn" onClick={() => handleDeleteOrder(o.id)}>Удалить заказ</button>
              </div>


              <div className="order-recipes-container">
                <p>Блюда</p>
                <ul className="order-recipes">
                  {o.items.map((item, i) => {
                    const recipe = findRecipe(item.recipeId);
                    return (
                      <li className="order-recipe-item" key={i}>
                        {recipe ? recipe.name : "???"} —{" "}
                        <input className="qty-person-input" type="number" min="1" value={item.qty} onChange={(e) => handleUpdateQty(o.id, i, e.target.value)} /> шт.
                        <button  onClick={() => handleDeleteItem(o.id, i)}>×</button>
                      </li>
                    );
                  })}
                </ul>
              </div>


              <div>
                <p>Продукты:</p>
                <ul className="order-summary">
                  {calculateProductsForOrder(o).map((p) => (
                    <li key={p.name}>{p.name} = {p.amount} {unitLabel(p.unit)}</li>
                  ))}
                </ul>
              </div>


              <p>Добавление блюда к заказу</p>
              <div className="order-add">



                <select className="select-catedory" value={addForm[o.id]?.category || ""} onChange={(e) => updateAddForm(o.id, "category", e.target.value)}>
                  <option value="">Категория</option>
                  <option value="all">Все</option>
                  <option value="salad">Салаты</option>
                  <option value="hot">Горячее</option>
                  <option value="snack">Закуски</option>
                  <option value="drink">Напитки</option>
                  <option value="dessert">Десерты</option>
                  <option value="other">Другое</option>
                </select>

                <select className="select-recipe" value={addForm[o.id]?.recipeId || ""} onChange={(e) => updateAddForm(o.id, "recipeId", e.target.value)}>
                  <option value="">Блюдо</option>
                  {recipes
                    .filter((r) =>
                      addForm[o.id]?.category && addForm[o.id]?.category !== "all"
                        ? r.category === addForm[o.id].category
                        : true
                    )
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({categoryLabel(r.category)})
                      </option>
                    ))}
                </select>

                <input className="add-recipe-qty" type="number" min="1" placeholder="Кол-во" value={addForm[o.id]?.qty || ""} onChange={(e) => updateAddForm(o.id, "qty", e.target.value)} />
                <button className="add-recipe-btn" onClick={() => handleAddItem(o.id)}>+ Добавить блюдо</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Orders;


