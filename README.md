# Shopvely – Full‑Stack E‑Commerce Store

Shopvely is a modern, Amazon‑style e‑commerce application built with React on the frontend and Django REST Framework on the backend. It provides a complete shopping flow with authentication, product browsing, search, cart, wishlist, orders, and a polished UI/UX.

---

## Table of Contents

- Features
- Tech Stack
- Project Structure
- Getting Started
  - Prerequisites
  - Backend Setup (Django)
  - Frontend Setup (React)
- Environment Variables
- Usage
- Future Improvements

---

## Features

- User authentication with JWT (register, login, logout)
- Protected pages for home, products, cart, wishlist, orders, and account
- Modern homepage hero: “Welcome to Shopvely – Your one‑stop shop for everything, Amazon‑style”
- Dedicated Products page with responsive product cards
- Navbar search with query params (`/products?q=...`) and result messages
- Shopping cart with item add/remove and badge count in navbar
- Wishlist system with:
  - Standalone wishlist page
  - “Move to cart” and “Remove” actions with per‑item loading states
  - Premium empty state card with CTA
- Orders list and order detail pages
- Account section (profile and order‑related links)
- Professional navigation bar with user dropdown (“Hi, username” → My Account + Logout)
- Clean, responsive footer with:
  - “Back to top” smooth scroll
  - Info columns (About, Connect, Help)
  - Language / region controls and legal links

---

## Tech Stack

- Frontend:
  - React
  - React Router
  - Modern CSS (custom components, responsive layout)
- Backend:
  - Python
  - Django
  - Django REST Framework (DRF)
- Auth & Security:
  - JWT (access + refresh tokens)
  - Protected API endpoints
  - Protected frontend routes
- Database:
  - SQLite for local development (can be switched to PostgreSQL or others)
- Tooling:
  - Node.js & npm
  - Python virtual environment
  - Git & GitHub
  - VS Code

---

## Project Structure

High‑level structure (may vary slightly from repo):

shopvely/
├── backend/
│ ├── manage.py
│ ├── <django_project>/
│ └── apps/
│ ├── users/
│ ├── products/
│ ├── cart/
│ ├── orders/
│ └── wishlist/
└── frontend/
├── package.json
└── src/
├── api.js
├── App.js
├── components/
│ ├── Navbar.jsx
│ ├── TopBar.jsx
│ ├── Footer.jsx
│ └── ProductCard.jsx
└── pages/
├── Home.jsx
├── ProductsPage.jsx
├── ProductDetails.jsx
├── Cart.jsx
├── Checkout.jsx
├── Orders.jsx
├── OrderDetail.jsx
├── Account.jsx
├── WishlistPage.jsx
├── Login.jsx
├── Register.jsx
└── About.jsx

text

---

## Getting Started

### Prerequisites

- Node.js (recommended LTS version)
- Python 3.x
- Git
- A virtual environment tool for Python (venv)

---

### Backend Setup (Django)

From the project root:

cd backend
python -m venv venv

Windows:
venv\Scripts\activate

macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt

Apply database migrations
python manage.py migrate

Run development server
python manage.py runserver

text

By default the API will be available at:

http://127.0.0.1:8000/

text

---

### Frontend Setup (React)

In another terminal window, from the project root:

cd frontend
npm install
npm start

text

The React app will run at:

http://localhost:3000/

text

Make sure the backend server is running so the frontend can access the API.

---

## Environment Variables

### Backend (Django)

Configure your Django settings (e.g. `.env` or environment variables):

- `SECRET_KEY` – Django secret key
- `DEBUG` – `True` for development, `False` for production
- `ALLOWED_HOSTS` – hostnames allowed to serve the app
- Database configuration (if not using default SQLite)
- JWT settings (if configured separately)

### Frontend (React)

Create `frontend/.env` if needed:

REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api

text

---

## Usage

1. Start the backend server (Django).
2. Start the frontend dev server (React).
3. Open `http://localhost:3000` in your browser.
4. Register a new account and log in.
5. Use the navbar to:
   - Home: view the hero landing page.
   - Products: browse all products and use the search bar.
   - Wishlist: manage liked products and move them to cart.
   - Cart: review items before checkout.
   - Orders: review past orders and details.
   - My Account: manage account‑related settings.
6. Use the user dropdown (“Hi, username”) to access My Account or Logout.

---

## Future Improvements

- Advanced filters (category, price, rating, sorting)
- Real payment gateway integration
- Admin dashboard for managing products, orders, and users
- Better notifications/toasts for actions and errors
- Automated tests for APIs and key UI flows

---

If you find this project useful or inspiring, feel free to star the repository and open issues or pull requests for suggestions and improvements.