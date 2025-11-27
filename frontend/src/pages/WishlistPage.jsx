// src/pages/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import API, { getWishlist, removeFromWishlist } from "../api";
import "./WishlistPage.css";

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();
        setItems(data.products || []);
      } catch (error) {
        console.error("Wishlist load error (page):", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setBusyId(productId);
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Remove wishlist error (page):", error);
      alert("Failed to remove from wishlist");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      setBusyId(product.id);
      await API.post("/cart/", {
        product_id: product.id,
        quantity: 1,
      });
      await removeFromWishlist(product.id);
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      alert("Moved to cart");
    } catch (error) {
      console.error("Move to cart error (page):", error);
      alert("Failed to move to cart");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="wp-wrapper wp-empty">
        <div className="wp-empty-card">
          <p className="wp-muted">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ✅ New classy empty state
  if (items.length === 0) {
    return (
      <div className="wp-wrapper wp-empty">
        <div className="wp-empty-card">
          <div className="wp-empty-icon">♡</div>
          <h2 className="wp-title">Your wishlist is waiting</h2>
          <p className="wp-muted">
            Save items you love and quickly find them here whenever you are ready to buy.
          </p>
          <button
            className="wp-empty-btn"
            onClick={() => (window.location.href = "/")}
          >
            Start shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-wrapper">
      <h2 className="wp-title">Your Wishlist</h2>
      <div className="wp-grid">
        {items.map((item) => (
          <div key={item.id} className="wp-card">
            <img src={item.image} alt={item.title} className="wp-image" />
            <h3 className="wp-name">{item.title}</h3>
            <p className="wp-price">₹{item.price}</p>
            <div className="wp-actions">
              <button
                className="wp-btn primary"
                disabled={busyId === item.id}
                onClick={() => handleMoveToCart(item)}
              >
                {busyId === item.id ? "Moving..." : "Move to cart"}
              </button>
              <button
                className="wp-btn"
                disabled={busyId === item.id}
                onClick={() => handleRemove(item.id)}
              >
                {busyId === item.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
