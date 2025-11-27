from django.urls import path
from .views import CartView, CheckoutView  # ✅ ensure yahi hai

urlpatterns = [
    path("", CartView.as_view(), name="cart"),
    path("checkout/", CheckoutView.as_view(), name="cart-checkout"),
]
