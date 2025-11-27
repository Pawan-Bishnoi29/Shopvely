import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ NEW
import API, { addToWishlist, removeFromWishlist } from "../api";
import "./OrderDetail.css";

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#f59e0b";
    case "processing":
      return "#3b82f6";
    case "shipped":
      return "#6366f1";
    case "delivered":
      return "#10b981";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ NEW
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const access = localStorage.getItem("access");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!access) {
        setLoading(false);
        setOrder(null);
        return;
      }

      try {
        const res = await API.get(`/orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order detail", err);
        // ✅ 401 pe force logout + login page
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("username");
          navigate("/login");
          return;
        }
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, access, navigate]);

  const handleAddToWishlist = async (productId) => {
    try {
      await addToWishlist(productId);
      setWishlist([...wishlist, productId]);
      alert("✅ Added to wishlist!");
    } catch (error) {
      console.error("Wishlist error:", error);
      if (error.response?.data?.detail === "Product already in wishlist") {
        await removeFromWishlistHandler(productId);
      } else {
        alert("❌ Failed to add to wishlist");
      }
    }
  };

  const removeFromWishlistHandler = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist(wishlist.filter((pid) => pid !== productId));
      alert("✅ Removed from wishlist!");
    } catch (error) {
      console.error("Remove wishlist error:", error);
      alert("❌ Failed to remove from wishlist");
    }
  };

  // Buy again for single product
  const handleBuyAgain = async (item) => {
    try {
      await API.post("/cart/", {
        product_id: item.product,
        quantity: 1,
      });
      alert("✅ Added to cart again");
    } catch (error) {
      console.error("Buy again error:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        navigate("/login");
        return;
      }
      alert("❌ Failed to add to cart");
    }
  };

  // Reorder all items from this order
  const handleReorderAll = async () => {
    if (!order || !order.items || order.items.length === 0) return;

    setReorderLoading(true);
    try {
      for (const item of order.items) {
        await API.post("/cart/", {
          product_id: item.product,
          quantity: item.quantity,
        });
      }
      alert("✅ All items added to cart");
    } catch (error) {
      console.error("Reorder error:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        navigate("/login");
        return;
      }
      alert("❌ Failed to reorder items");
    } finally {
      setReorderLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${id}/invoice/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("username");
          navigate("/login");
          return;
        }
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-Order-${id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  if (!access) {
    return (
      <div className="order-detail-wrapper">
        <div className="order-detail-container">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", color: "#475569" }}>
              Please login to view order details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-detail-wrapper">
        <div className="order-detail-container">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", color: "#475569" }}>
              Loading order...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-wrapper">
        <div className="order-detail-container">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", color: "#ef4444" }}>
              Order not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-wrapper">
      <div className="order-detail-container">
        {/* Header */}
        <div className="order-header">
          <h2>Order #{order.id}</h2>
          <p className="order-header-subtitle">
            Thank you for your purchase
          </p>
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status_display || order.status}
          </span>
        </div>

        {/* Content */}
        <div className="order-content">
          {/* Summary Cards */}
          <div className="order-summary-grid">
            <div className="summary-card summary-card-total">
              <span className="summary-label">Total Amount</span>
              <span className="summary-value amount">
                ₹{parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>

            <div className="summary-card summary-card-date">
              <span className="summary-label">Order Date</span>
              <span className="summary-value">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="summary-card summary-card-time">
              <span className="summary-label">Order Time</span>
              <span className="summary-value">
                {new Date(order.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Current Status card */}
            <div className="summary-card summary-card-status">
              <span className="status-card-label">Current Status</span>
              <span
                className="status-card-value"
                style={{
                  color: getStatusColor(order.status),
                  textTransform: "capitalize",
                }}
              >
                {order.status_display || order.status}
              </span>
            </div>
          </div>

          {/* ✅ Shipping address card */}
          <div className="shipping-card">
            <h3 className="section-title">📍 Shipping address</h3>
            {order.shipping_full_name ? (
              <div className="shipping-address">
                <div className="shipping-line">
                  {order.shipping_full_name}
                </div>
                <div className="shipping-line">
                  {order.shipping_line1}
                  {order.shipping_line2 && `, ${order.shipping_line2}`}
                </div>
                <div className="shipping-line">
                  {order.shipping_city}, {order.shipping_state}{" "}
                  {order.shipping_pincode}
                </div>
                <div className="shipping-line">
                  Phone: {order.shipping_phone}
                </div>
              </div>
            ) : (
              <p className="shipping-missing">
                No shipping address stored for this order.
              </p>
            )}
          </div>

          {/* Items Table */}
          <div className="items-section">
            <h3 className="section-title">📦 Order Items</h3>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="qty-center">Quantity</th>
                  <th className="price-right">Unit Price</th>
                  <th className="price-right">Total</th>
                  <th style={{ textAlign: "center" }}>Wishlist</th>
                  <th style={{ textAlign: "center" }}>Buy again</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="product-name">
                      {item.product_title || `Product #${item.product}`}
                    </td>
                    <td className="qty-center">{item.quantity}</td>
                    <td className="price-right">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="price-right">
                      ₹
                      {(
                        parseFloat(item.price) * item.quantity
                      ).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>
                      <button
                        onClick={() =>
                          handleAddToWishlist(item.product)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "24px",
                          padding: "0",
                          transition: "transform 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.transform = "scale(1.3)")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.transform = "scale(1)")
                        }
                        title={
                          wishlist.includes(item.product)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                      >
                        {wishlist.includes(item.product)
                          ? "❤️"
                          : "🤍"}
                      </button>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="buy-again-btn"
                        onClick={() => handleBuyAgain(item)}
                      >
                        Buy again
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="5" style={{ textAlign: "right" }}>
                    Grand Total:
                  </td>
                  <td className="price-right">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="timeline-section">
              <h3 className="section-title">📋 Order Timeline</h3>
              <div className="timeline">
                {order.status_history.map((history) => (
                  <div key={history.id} className="timeline-item">
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor: getStatusColor(
                          history.new_status
                        ),
                      }}
                    />
                    <div
                      className="timeline-content"
                      style={{
                        borderLeftColor: getStatusColor(
                          history.new_status
                        ),
                      }}
                    >
                      <p className="timeline-status">
                        {history.new_status_display ||
                          history.new_status}
                      </p>
                      <p className="timeline-date">
                        {new Date(
                          history.changed_at
                        ).toLocaleString("en-IN")}
                      </p>
                      {history.changed_by_username && (
                        <p className="timeline-user">
                          Updated by: {history.changed_by_username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="order-actions">
            <button
              className="invoice-button"
              onClick={handleDownloadInvoice}
            >
              📄 Download Invoice
            </button>
            <button
              className="reorder-button"
              onClick={handleReorderAll}
              disabled={reorderLoading}
            >
              🔁 {reorderLoading ? "Adding..." : "Reorder all items"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
