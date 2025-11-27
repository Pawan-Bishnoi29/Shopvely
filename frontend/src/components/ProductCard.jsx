import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import API from "../api";

const ProductCard = ({ product }) => {
  const handleAddToCart = async () => {
    const access = localStorage.getItem("access");
    if (!access) {
      alert("Please login to use cart");
      return;
    }

    try {
      const res = await API.post("/cart/", {
        product_id: product.id,
        quantity: 1,
      });
      console.log("Cart updated:", res.data);
      alert("Added to cart!");
    } catch (err) {
      console.error("Error adding to cart", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to add to cart.");
      }
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image-wrap">
        <img
          src={product.image}
          alt={product.title}
          className="product-card-image"
        />
      </Link>

      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-title">
          {product.title}
        </Link>
        <p className="product-card-subtitle">
          Popular choice on Shopvely
        </p>

        <div className="product-card-price-row">
          <span className="product-card-price">
            ₹{Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="product-card-footer">
        <button
          className="product-card-btn"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
        <Link to={`/product/${product.id}`} className="product-card-link">
          View details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
