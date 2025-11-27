import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { getWishlist, getCartSummary } from "../api";

const Navbar = ({ username, onLogout }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false); // ✅ NEW
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    const loadCounts = async () => {
      try {
        const cart = await getCartSummary();
        setCartCount(cart.count);

        const wishlistData = await getWishlist();
        const products = wishlistData.products || [];
        setWishlistCount(products.length);
      } catch (error) {
        console.error("Navbar counts error:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("username");
          if (onLogout) onLogout();
          navigate("/login");
        }
      }
    };

    loadCounts();
  }, [username, navigate, onLogout]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    navigate(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-main">Shopvely</span>
          <span className="nav-logo-sub">store</span>
        </Link>

        {username && (
          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <input
              className="nav-search-input"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="nav-search-btn" type="submit">
              Search
            </button>
          </form>
        )}
      </div>

      <nav className="nav-right">
        {username ? (
          <>
            {/* ✅ User menu (Hi, Pvn at the end) */}
            <Link to="/" className="nav-link-text">
              Home
            </Link>

            <Link to="/account" className="nav-link-text">
              My Account
            </Link>

            <Link
              to="/wishlist"
              className="nav-link-text nav-wishlist-link"
            >
              Wishlist
              {wishlistCount > 0 && (
                <span className="nav-badge">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/products" className="nav-link-text">
              Products
            </Link>

            <Link to="/orders" className="nav-link-text">
              Orders
            </Link>

            <Link to="/cart" className="nav-cart">
              <span className="nav-cart-count">{cartCount}</span>
              <span className="nav-cart-text">Cart</span>
            </Link>

            <div className="nav-user-menu">
              <button
                type="button"
                className="nav-link-text nav-user-toggle"
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                Hi, {username}
                <span className="nav-user-caret">▾</span>
              </button>

              {userMenuOpen && (
                <div className="nav-user-dropdown">
                  <Link
                    to="/account"
                    className="nav-user-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    className="nav-user-item nav-user-logout"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link-text">
              Login
            </Link>
            <Link to="/register" className="nav-link-text">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
