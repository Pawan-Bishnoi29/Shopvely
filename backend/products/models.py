from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Product(models.Model):
    title = models.CharField(
        max_length=255,
        verbose_name="Product title",
        help_text="Short name shown in listings",
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description",
        help_text="Detailed information about the product",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Price (₹)",
        help_text="Selling price in INR",
    )
    image = models.URLField(
        blank=True,
        verbose_name="Image URL",
        help_text="Link to product image",
    )
    rating = models.FloatField(
        default=0,
        verbose_name="Rating",
        help_text="Average customer rating (0–5)",
    )
    num_reviews = models.IntegerField(
        default=0,
        verbose_name="Number of reviews",
        help_text="Total count of customer reviews",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created at",
    )

    def __str__(self):
        return self.title


class Wishlist(models.Model):
    """
    User ke wishlist items - products ko save karne ke liye
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="wishlist",
        verbose_name="User",
    )
    products = models.ManyToManyField(
        Product,
        related_name="wishlists",
        blank=True,
        verbose_name="Products",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Wishlist"
        verbose_name_plural = "Wishlists"

    def __str__(self):
        return f"Wishlist of {self.user.username}"
