import React, { useState } from "react";
import API from "../api";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // /auth/login/ se 404 aa raha tha, SimpleJWT ke liye /token/ use karo
      const res = await API.post("/token/", {
        username,
        password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("username", username);

      if (onLoginSuccess) {
        onLoginSuccess(username);
      }

      // ✅ successful login ke baad home page pe redirect
      window.location.href = "/";
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid username or password.");
    } finally {
      setSubmitting(false);
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
          maxWidth: "400px",
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
            Welcome back
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Sign in to continue shopping on Shopvely
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
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #ec4899 100%)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.8 : 1,
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
              boxShadow: "0 8px 16px rgba(79,70,229,0.35)",
            }}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div
          style={{
            marginTop: "12px",
            fontSize: "13px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
