import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
      alert("Failed to add to cart");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}/`);
        setProduct(res.data);
      } catch (error) {
        console.error("Product load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="pd-wrapper">
        <div className="pd-container">
          <p className="pd-muted">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-wrapper">
        <div className="pd-container">
          <p className="pd-error">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-wrapper">
      <div className="pd-container">
        {/* Left: image */}
        <div className="pd-left">
          <div className="pd-image-card">
            <img
              src={product.image}
              alt={product.title}
              className="pd-image"
            />
          </div>
        </div>

        {/* Right: info */}
        <div className="pd-right">
          <h1 className="pd-title">{product.title}</h1>
          <p className="pd-subtitle">
            A curated pick from Shopvely, crafted for everyday use.
          </p>

          <div className="pd-price-row">
            <span className="pd-price">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            className="pd-add-btn"
            onClick={handleAddToCart}
          >
            Add to cart
          </button>

          <div className="pd-meta">
            <p>Inclusive of all taxes.</p>
            <p>Free delivery on orders above ₹499.</p>
          </div>

          <div className="pd-description">
            <h3>Product details</h3>
            <p>
              {product.description ||
                "Detailed information for this product will be available soon."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
