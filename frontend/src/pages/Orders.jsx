import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Orders.css";

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

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const access = localStorage.getItem("access");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!access) {
        setLoading(false);
        setOrders(null);
        return;
      }

      try {
        const res = await API.get("/orders/");
        setOrders(res.data);
        setError(null);
      } catch (err) {
        console.error(
          "❌ Error fetching orders:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.detail || "Failed to load orders");
        setOrders(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [access]);

  // apply filters + search when orders / filters change
  useEffect(() => {
    if (!orders) {
      setFiltered(null);
      return;
    }

    let data = [...orders];

    // status filter
    if (statusFilter !== "all") {
      data = data.filter((o) => o.status === statusFilter);
    }

    // date filter
    const now = new Date();
    if (dateFilter === "30") {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      data = data.filter((o) => new Date(o.created_at) >= cutoff);
    } else if (dateFilter === "180") {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 180);
      data = data.filter((o) => new Date(o.created_at) >= cutoff);
    }

    // search by order id
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      data = data.filter((o) =>
        String(o.id).toLowerCase().includes(term)
      );
    }

    setFiltered(data);
  }, [orders, statusFilter, dateFilter, searchTerm]);

  if (!access) {
    return (
      <div className="orders-wrapper">
        <div className="orders-container">
          <div className="empty-state">
            <div className="empty-state-icon">🔐</div>
            <h3>Authentication Required</h3>
            <p>Please login to view your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-wrapper">
        <div className="orders-container">
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <h3>Loading Orders...</h3>
            <p>Please wait while we fetch your orders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-wrapper">
        <div className="orders-container">
          <div className="empty-state" style={{ background: "#fee2e2" }}>
            <div className="empty-state-icon">❌</div>
            <h3 style={{ color: "#dc2626" }}>Error Loading Orders</h3>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!filtered || filtered.length === 0) {
    return (
      <div className="orders-wrapper">
        <div className="orders-container">
          <div className="orders-header">
            <h2>📋 My Orders</h2>
            <p>Track and manage all your purchases</p>
          </div>

          {/* Filters bar even if empty */}
          <div className="orders-filters">
            <input
              type="text"
              className="orders-search"
              placeholder="Search by Order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="orders-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="orders-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Any time</option>
              <option value="30">Last 30 days</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>

          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No Orders Found</h3>
            <p>
              {orders && orders.length > 0
                ? "Try changing filters or search."
                : "You haven't placed any orders. Start shopping now!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-wrapper">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h2>📋 My Orders</h2>
          <p>Track and manage all your purchases</p>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <input
            type="text"
            className="orders-search"
            placeholder="Search by Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="orders-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="orders-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Any time</option>
            <option value="30">Last 30 days</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filtered.map((order) => (
            <div
              key={order.id}
              className={`order-card ${order.status}`}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="card-order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="card-date">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="card-header-right">
                  <span
                    className={`status-badge ${order.status}`}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status_display || order.status}
                  </span>
                  <p className="card-amount">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body">
                <span className="items-label">
                  Items ({order.items.length})
                </span>
                <div className="items-mini-list">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="item-mini">
                      <span className="item-mini-name">
                        {item.product_title || `Product #${item.product}`}
                      </span>
                      <span className="item-mini-qty">×{item.quantity}</span>
                      <span className="item-mini-price">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "4px",
                      }}
                    >
                      +{order.items.length - 3} more item(s)
                    </div>
                  )}
                </div>

                {/* ✅ Delivery address snapshot */}
                <div className="order-address-block">
                  <div className="order-address-title">Deliver to</div>
                  {order.shipping_full_name ? (
                    <>
                      <div className="order-address-line">
                        {order.shipping_full_name}
                      </div>
                      <div className="order-address-line">
                        {order.shipping_line1}
                        {order.shipping_line2 && `, ${order.shipping_line2}`}
                      </div>
                      <div className="order-address-line">
                        {order.shipping_city}, {order.shipping_state}{" "}
                        {order.shipping_pincode}
                      </div>
                      <div className="order-address-line">
                        Phone: {order.shipping_phone}
                      </div>
                    </>
                  ) : (
                    <div className="order-address-line muted">
                      No shipping address stored for this order.
                    </div>
                  )}
                </div>

                <a
                  href={`/orders/${order.id}`}
                  className="view-details-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Full Details →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
