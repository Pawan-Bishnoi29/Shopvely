from django.urls import path
from .views import ProductListAPIView, ProductDetailAPIView, WishlistView

urlpatterns = [
    path("", ProductListAPIView.as_view(), name="product-list"),
    path("<int:id>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
]
