from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "change-this-to-your-secret-key"  # tumhare file me jo bhi hai, wahi rehne do

DEBUG = True  # dev ke लिए

ALLOWED_HOSTS = []  # ya ["127.0.0.1", "localhost"]

INSTALLED_APPS = [
    # ✅ Jazzmin sabse upar
    "jazzmin",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Local apps
    "users",
    "products",
    "cart",
    "orders",
    "addresses",  # ✅ NEW
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "ecommerce.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Project-level templates folder (optional, future use ke liye handy)
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# ✅ Jazzmin branding & UI settings
JAZZMIN_SETTINGS = {
    "site_title": "Shopvely Admin",
    "site_header": "Shopvely Dashboard",
    "site_brand": "Shopvely",

    "site_logo": None,  # baad me static/logo.png de sakte ho
    "site_icon": None,

    "welcome_sign": "Welcome back, Admin 👋",
    "copyright": "© 2025 Shopvely",

    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "icon": "fas fa-home"},
        {"app": "products"},
        {"app": "orders"},
        {"app": "users"},
    ],

    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],

    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",

        "users": "fas fa-user-shield",
        "users.user": "fas fa-user-shield",

        "products": "fas fa-box-open",
        "products.product": "fas fa-box",

        "orders": "fas fa-shopping-bag",
        "orders.order": "fas fa-receipt",

        "cart": "fas fa-shopping-cart",
        "cart.cart": "fas fa-shopping-cart",
    },

    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    "changeform_format": "horizontal_tabs",
}

# CORS settings for React frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
# CORS_ALLOW_ALL_ORIGINS = True  # sirf dev testing ke लिए, prod me mat rakhna

# Static files (CSS, JS, Images)
STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
