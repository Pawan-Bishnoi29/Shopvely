import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Account from "./pages/Account";
import WishlistPage from "./pages/WishlistPage";
import ProductsPage from "./pages/ProductsPage"; // ✅ NEW
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  const [username, setUsername] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) {
      setUsername(stored);
    }
  }, []);

  const handleLoginSuccess = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUsername(null);
    window.location.href = "/";
  };

  // Login/Register pages par sirf Navbar + auth form dikhana
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-root">
      <Navbar username={username} onLogout={handleLogout} />

      {/* TopBar + main content sirf jab auth page nahi ho */}
      {!isAuthPage && <TopBar username={username} />}

      <main className="app-main">
        <Routes>
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW: all products listing */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          {/* standalone wishlist page */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Public routes */}
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      {/* Footer bhi sirf auth page ke alawa */}
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
