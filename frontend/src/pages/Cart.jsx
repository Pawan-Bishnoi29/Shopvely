import React, { useEffect, useState } from "react";
import "./Cart.css";
import API, { getAddresses, checkoutCart } from "../api";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const access = localStorage.getItem("access");

  const fetchCart = async () => {
    if (!access) {
      setLoading(false);
      setCart(null);
      return;
    }

    try {
      const res = await API.get("/cart/");
      setCart(res.data);
    } catch (err) {
      console.error("Error fetching cart", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!access) {
      setAddresses([]);
      setAddressLoading(false);
      return;
    }

    try {
      const data = await getAddresses();
      setAddresses(data);
      // default address select karo, nahi to first
      if (data.length > 0) {
        const defaultAddr =
          data.find((a) => a.is_default) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error("Error loading addresses", err);
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuantityChange = async (itemId, quantity) => {
    try {
      const res = await API.patch("/cart/", {
        item_id: itemId,
        quantity,
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error updating cart", err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await API.delete("/cart/", {
        data: { item_id: itemId },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  const handleCheckout = async () => {
    if (!access) return;

    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    setPlacingOrder(true);
    setOrderMessage("");

    try {
      const data = await checkoutCart(selectedAddressId);
      setOrderMessage(`Order #${data.order_id} placed successfully!`);

      // backend ne cart clear kar diya; frontend state bhi reset karo
      setCart((prev) =>
        prev
          ? {
              ...prev,
              items: [],
              total_items: 0,
              total_price: 0,
            }
          : prev
      );
    } catch (err) {
      console.error("Error during checkout", err);
      // DRF se error detail ho to show
      const detail =
        err.response?.data?.detail ||
        "Failed to place order. Please try again.";
      setOrderMessage(detail);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!access) {
    return (
      <div className="cart-wrapper">
        <div className="cart-container">
          <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <h3>Authentication Required</h3>
            <p>Please login to view your cart.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-wrapper">
        <div className="cart-container">
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading Cart...</h3>
            <p>Please wait while we fetch your cart items.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="cart-wrapper">
        <div className="cart-container">
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>Error Loading Cart</h3>
            <p>Failed to load your cart. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrapper">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
          <p className="cart-header-subtitle">
            Review your items and choose a delivery address
          </p>
        </div>

        {/* Main Content */}
        <div className="cart-content">
          {/* Left: Items */}
          <div className="cart-items-section">
            <h3 className="section-title">Cart Items</h3>

            {cart.items.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">📦</div>
                <p className="empty-cart-text">Your cart is empty</p>
                <p className="empty-cart-subtext">
                  Add items to get started!
                </p>
                {orderMessage && (
                  <div className="success-message">
                    ✅ {orderMessage}
                  </div>
                )}
              </div>
            ) : (
              <>
                <ul className="items-list">
                  {cart.items.map((item) => (
                    <li key={item.id} className="cart-item">
                      <div className="item-details">
                        <div className="item-name">
                          {item.product.title}
                        </div>
                        <div className="item-price-qty">
                          <span className="item-unit-price">
                            ₹
                            {parseFloat(
                              item.product.price
                            ).toFixed(2)}
                          </span>
                          <span className="item-multiply">×</span>
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                Number(e.target.value)
                              )
                            }
                            className="qty-select"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                              (q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="item-total">
                          ₹
                          {(
                            parseFloat(item.product.price) *
                            item.quantity
                          ).toFixed(2)}
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveItem(item.id)
                          }
                          className="remove-btn"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {orderMessage && (
                  <div className="success-message">
                    ✅ {orderMessage}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Summary + Address selection */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span className="summary-label">Total Items</span>
                <span className="summary-value">
                  {cart.total_items}
                </span>
              </div>

              <div className="summary-row summary-divider">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">
                  ₹
                  {parseFloat(cart.total_price).toFixed(2)}
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">FREE</span>
              </div>

              <div className="summary-row summary-divider">
                <span className="summary-label">Tax</span>
                <span className="summary-value">₹0.00</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>
                  ₹
                  {parseFloat(cart.total_price).toFixed(2)}
                </span>
              </div>

              {/* Address chooser */}
              <div className="summary-divider" />

              <h4 className="summary-subtitle">
                Delivery address
              </h4>

              {addressLoading ? (
                <p className="summary-note">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <p className="summary-note">
                  No saved addresses. Please add one in your
                  Account &gt; Addresses tab before placing an order.
                </p>
              ) : (
                <div className="address-radio-list">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="address-radio-item"
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() =>
                          setSelectedAddressId(addr.id)
                        }
                      />
                      <div>
                        <div className="address-radio-name">
                          {addr.full_name}{" "}
                          {addr.is_default && (
                            <span className="address-pill">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="address-radio-line">
                          {addr.line1}
                          {addr.line2 && `, ${addr.line2}`}
                        </div>
                        <div className="address-radio-line">
                          {addr.city}, {addr.state}{" "}
                          {addr.pincode}
                        </div>
                        <div className="address-radio-line">
                          Phone: {addr.phone}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={
                  placingOrder ||
                  cart.items.length === 0 ||
                  addresses.length === 0 ||
                  !selectedAddressId
                }
                className="checkout-btn"
              >
                {placingOrder ? (
                  <>
                    <span className="spinner"></span>
                    Placing Order...
                  </>
                ) : (
                  <>💳 Place Order</>
                )}
              </button>

              <button
                className="continue-shopping-btn"
                onClick={() => (window.location.href = "/")}
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
