import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Back to top */}
      <div
        className="footer-backtotop"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
      </div>

      <div className="footer-inner">
        {/* Main columns */}
        <div className="footer-main">
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <Link to="/about">About Shopvely</Link>
          </div>

          <div className="footer-col">
            <h4>Connect with Me</h4>
            <a
              href="https://github.com/Pawan-Bishnoi29"
              target="_blank"
              rel="noreferrer"
            >
              🐙 GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/pawan-bishnoi-5a79752b1/"
              target="_blank"
              rel="noreferrer"
            >
              💼 LinkedIn
            </a>
          </div>

          <div className="footer-col">
            <h4>Let Us Help You</h4>
            <Link to="/account">Your Account</Link>
            <Link to="/returns">Returns Centre</Link>
          </div>
        </div>

        {/* Country + language row */}
        <div className="footer-locale">
          <div className="footer-logo">Shopvely</div>
          <div className="footer-locale-controls">
            <button className="footer-btn">🌐 English</button>
            <button className="footer-btn">🇮🇳 India</button>
          </div>
        </div>

        {/* Legal row */}
        <div className="footer-bottom">
          <div className="footer-bottom-links">
            <a href="/conditions">Conditions of Use &amp; Sale</a>
            <a href="/privacy">Privacy Notice</a>
            <a href="/ads">Interest-Based Ads</a>
          </div>
          <div className="footer-bottom-copy">
            © {new Date().getFullYear()}, Shopvely, Inc. or its affiliates
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
