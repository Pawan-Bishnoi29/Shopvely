import React from "react";
import { Link } from "react-router-dom";
import "./SideMenu.css";

const SideMenu = ({ open, onClose, username }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`sidemenu-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className={`sidemenu ${open ? "open" : ""}`}>
        <div className="sidemenu-header">
          <span className="sidemenu-close" onClick={onClose}>
            ×
          </span>
          <span className="sidemenu-title">
            {username ? `Hello, ${username}` : "Hello, Sign in"}
          </span>
        </div>

        <div className="sidemenu-section">
          <h4>Trending</h4>
          <Link to="/bestsellers">Bestsellers</Link>
          <Link to="/new-releases">New Releases</Link>
          <Link to="/movers-shakers">Movers and Shakers</Link>
        </div>

        <div className="sidemenu-section">
          <h4>Digital Content &amp; Devices</h4>
          <Link to="/echo-alexa">Echo &amp; Alexa</Link>
          <Link to="/fire-tv">Fire TV</Link>
          <Link to="/ebooks">E‑Readers &amp; eBooks</Link>
          <Link to="/audiobooks">Audio Books</Link>
          <Link to="/prime-video">Prime Video</Link>
          <Link to="/prime-music">Prime Music</Link>
        </div>

        <div className="sidemenu-section">
          <h4>Shop by Category</h4>
          <Link to="/category/mobiles-computers">Mobiles &amp; Computers</Link>
          <Link to="/category/tv-appliances">TV, Appliances &amp; Electronics</Link>
          <Link to="/category/mens-fashion">Men&apos;s Fashion</Link>
          <Link to="/category/womens-fashion">Women&apos;s Fashion</Link>
          <Link to="/categories">See all</Link>
        </div>

        <div className="sidemenu-section">
          <h4>Programs &amp; Features</h4>
          <Link to="/gift-cards-recharge">Gift Cards &amp; Recharges</Link>
          <Link to="/launchpad">Shopvely Launchpad</Link>
          <Link to="/business">Shopvely Business</Link>
          <Link to="/handloom">Handloom &amp; Handicrafts</Link>
          <Link to="/programs">See all</Link>
        </div>

        <div className="sidemenu-section">
          <h4>Help &amp; Settings</h4>
          <Link to="/account">Your Account</Link>
          <Link to="/help">Customer Service</Link>
          <Link to="/logout">Sign Out</Link>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
