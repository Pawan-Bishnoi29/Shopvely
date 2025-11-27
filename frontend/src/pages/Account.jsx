import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Account.css";
import API, {
  getWishlist,
  removeFromWishlist,
  getAddresses,
  createAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
} from "../api";

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL ?tab=... se initial tab lo
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Tab change helper + URL clean
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (location.search) {
      navigate("/account", { replace: true });
    }
  };

  return (
    <div className="account-wrapper">
      <div className="account-container">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <h2 className="account-title">My Account</h2>
          <p className="account-username">
            {localStorage.getItem("username") || "User"}
          </p>

          <nav className="account-nav">
            <button
              className={
                activeTab === "dashboard"
                  ? "account-nav-item active"
                  : "account-nav-item"
              }
              onClick={() => handleTabChange("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={
                activeTab === "orders"
                  ? "account-nav-item active"
                  : "account-nav-item"
              }
              onClick={() => navigate("/orders")}
            >
              Orders
            </button>
            <button
              className={
                activeTab === "wishlist"
                  ? "account-nav-item active"
                  : "account-nav-item"
              }
              onClick={() => handleTabChange("wishlist")}
            >
              Wishlist
            </button>
            <button
              className={
                activeTab === "addresses"
                  ? "account-nav-item active"
                  : "account-nav-item"
              }
              onClick={() => handleTabChange("addresses")}
            >
              Addresses
            </button>
            <button
              className={
                activeTab === "account"
                  ? "account-nav-item active"
                  : "account-nav-item"
              }
              onClick={() => handleTabChange("account")}
            >
              Account details
            </button>

            <button
              className="account-nav-item logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <section className="account-content">
          {activeTab === "dashboard" && <DashboardSection />}

          {activeTab === "wishlist" && <WishlistSection />}

          {activeTab === "addresses" && <AddressesSection />}

          {activeTab === "account" && <AccountDetailsSection />}
        </section>
      </div>
    </div>
  );
};

export default Account;

/* ===== Dashboard ===== */

const DashboardSection = () => {
  const username = localStorage.getItem("username") || "there";
  const navigate = useNavigate();

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-heading">Welcome back, {username} 👋</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card primary">
          <p className="dashboard-label">Quick action</p>
          <h4 className="dashboard-value">View your orders</h4>
          <p className="dashboard-sub">
            Track status, download invoices, reorder items.
          </p>
          <button
            className="dashboard-btn"
            onClick={() => navigate("/orders")}
          >
            Go to orders
          </button>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-label">Wishlist</p>
          <h4 className="dashboard-value">Saved products</h4>
          <p className="dashboard-sub">
            Quickly access items you have liked.
          </p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-label">Account</p>
          <h4 className="dashboard-value">Profile & addresses</h4>
          <p className="dashboard-sub">
            Update your details and delivery addresses.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===== Wishlist tab (connected to API) ===== */

const WishlistSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // backend se wishlist fetch
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();
        // data: { id, products: [...] }
        setItems(data.products || []);
      } catch (error) {
        console.error("Wishlist load error:", error);
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
      console.error("Remove wishlist error:", error);
      alert("❌ Failed to remove from wishlist");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    try {
      setBusyId(product.id);
      // cart API: /api/cart/ POST { product_id, quantity }
      await API.post("/cart/", {
        product_id: product.id,
        quantity: 1,
      });
      await removeFromWishlist(product.id);
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      alert("✅ Moved to cart");
    } catch (error) {
      console.error("Move to cart error:", error);
      alert("❌ Failed to move to cart");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-section">
        <h3 className="section-heading">Your Wishlist</h3>
        <p className="muted-text">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-section">
      <h3 className="section-heading">Your Wishlist</h3>
      {items.length === 0 ? (
        <p className="muted-text">You have no items in your wishlist yet.</p>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => (
            <div key={item.id} className="wishlist-item">
              <img
                src={item.image}
                alt={item.title}
                className="wishlist-thumb"
              />
              <div className="wishlist-info">
                <h4>{item.title}</h4>
                <p>₹{item.price}</p>
              </div>
              <div className="wishlist-actions">
                <button
                  className="wishlist-btn primary"
                  disabled={busyId === item.id}
                  onClick={() => handleMoveToCart(item)}
                >
                  {busyId === item.id ? "Moving..." : "Move to cart"}
                </button>
                <button
                  className="wishlist-btn"
                  disabled={busyId === item.id}
                  onClick={() => handleRemove(item.id)}
                >
                  {busyId === item.id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===== Addresses tab (connected to API) ===== */

const AddressesSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });
  const [busyId, setBusyId] = useState(null);

  // load addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (error) {
        console.error("Addresses load error:", error);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setBusyId("new");
      const created = await createAddress(formData);
      setAddresses((prev) => [created, ...prev]);
      setFormData({
        full_name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Create address error:", error);
      alert("❌ Failed to add address");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      setBusyId(id);
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Delete address error:", error);
      alert("❌ Failed to delete address");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setBusyId(id);
      const updated = await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === updated.id
            ? { ...a, is_default: true }
            : { ...a, is_default: false }
        )
      );
    } catch (error) {
      console.error("Set default error:", error);
      alert("❌ Failed to set default");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="addresses-section">
        <div className="addresses-header">
          <h3 className="section-heading">Saved Addresses</h3>
        </div>
        <p className="muted-text">Loading your addresses...</p>
      </div>
    );
  }

  return (
    <div className="addresses-section">
      <div className="addresses-header">
        <h3 className="section-heading">Saved Addresses</h3>
        <button
          className="address-add-btn"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Cancel" : "+ Add new address"}
        </button>
      </div>

      {showForm && (
        <form className="address-form" onSubmit={handleCreate}>
          <div className="form-row">
            <label>Full name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Address line 1</label>
            <input
              type="text"
              name="line1"
              value={formData.line1}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Address line 2</label>
            <input
              type="text"
              name="line2"
              value={formData.line2}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label>Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row form-row-inline">
            <label>
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
              />{" "}
              Set as default address
            </label>
          </div>

          <button
            type="submit"
            className="primary-save-btn"
            disabled={busyId === "new"}
          >
            {busyId === "new" ? "Saving..." : "Save address"}
          </button>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="muted-text">
          You have no saved addresses. Add one to speed up checkout.
        </p>
      ) : (
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className="address-card">
              <div className="address-card-header">
                <span className="address-label">{addr.full_name}</span>
                {addr.is_default && (
                  <span className="address-pill">Default</span>
                )}
              </div>
              <p className="address-line">{addr.line1}</p>
              {addr.line2 && (
                <p className="address-line">{addr.line2}</p>
              )}
              <p className="address-line">
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="address-line">Phone: {addr.phone}</p>

              <div className="address-actions">
                <button
                  className="address-btn"
                  disabled={busyId === addr.id}
                  onClick={() => handleDelete(addr.id)}
                >
                  {busyId === addr.id ? "Deleting..." : "Delete"}
                </button>
                {!addr.is_default && (
                  <button
                    className="address-btn primary"
                    disabled={busyId === addr.id}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    {busyId === addr.id ? "Setting..." : "Set as default"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ===== Account details + Security tab ===== */

const AccountDetailsSection = () => {
  const storedUsername = localStorage.getItem("username") || "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setSaving(true);
      await changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.old_password && data.old_password[0]) {
          setPasswordError(data.old_password[0]);
        } else if (data.new_password && data.new_password[0]) {
          setPasswordError(data.new_password[0]);
        } else if (data.detail) {
          setPasswordError(data.detail);
        } else {
          setPasswordError("Failed to update password.");
        }
      } else {
        setPasswordError("Failed to update password.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-details-section">
      <h3 className="section-heading">Account details</h3>

      <form className="account-form">
        <div className="form-row">
          <label>Full name</label>
          <input type="text" defaultValue={storedUsername} />
        </div>

        <div className="form-row">
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" />
        </div>

        <div className="form-row">
          <label>Phone number</label>
          <input type="tel" placeholder="+91" />
        </div>

        <button type="button" className="primary-save-btn">
          Save profile
        </button>
      </form>

      <hr className="section-divider" />

      <h4 className="section-subheading">Security</h4>
      <form className="account-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <label>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Confirm new password</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>

        {passwordError && (
          <p className="form-error-text">{passwordError}</p>
        )}
        {passwordMessage && (
          <p className="form-success-text">{passwordMessage}</p>
        )}

        <button
          type="button"
          className="primary-save-btn"
          onClick={handlePasswordUpdate}
          disabled={saving}
        >
          {saving ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
};
