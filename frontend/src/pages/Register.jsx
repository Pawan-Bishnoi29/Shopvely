import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let msg = "Registration failed";
        try {
          const data = await res.json();
          if (data.detail) msg = data.detail;
        } catch (_) {}
        setError(msg);
        setLoading(false);
        return;
      }

      alert("Account created successfully. Please login.");
      // simple redirect without hooks (same style as existing code)
      window.location.href = "/login";
    } catch (err) {
      console.error("Register error", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
          padding: "24px 28px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: "18px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Create your account
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Join Shopvely and start your shopping journey
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              borderRadius: "6px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Username
            </label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #ec4899 0%, #6366f1 50%, #4f46e5 100%)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.8 : 1,
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
              boxShadow: "0 8px 16px rgba(236,72,153,0.35)",
            }}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
