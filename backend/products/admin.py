from django.contrib import admin
from .models import Product


class RatingFilter(admin.SimpleListFilter):
    title = "Rating"
    parameter_name = "rating_bucket"

    def lookups(self, request, model_admin):
        return [
            ("4_plus", "⭐ 4.0 and above"),
            ("3_4", "⭐ 3.0 – 3.9"),
            ("below_3", "⭐ below 3.0"),
        ]

    def queryset(self, request, queryset):
        value = self.value()
        if value == "4_plus":
            return queryset.filter(rating__gte=4)
        if value == "3_4":
            return queryset.filter(rating__gte=3, rating__lt=4)
        if value == "below_3":
            return queryset.filter(rating__lt=3)
        return queryset


class PriceFilter(admin.SimpleListFilter):
    title = "Price range (₹)"
    parameter_name = "price_bucket"

    def lookups(self, request, model_admin):
        return [
            ("lt_500", "₹0 – ₹499"),
            ("500_1999", "₹500 – ₹1,999"),
            ("2000_4999", "₹2,000 – ₹4,999"),
            ("gte_5000", "₹5,000+"),
        ]

    def queryset(self, request, queryset):
        value = self.value()
        if value == "lt_500":
            return queryset.filter(price__lt=500)
        if value == "500_1999":
            return queryset.filter(price__gte=500, price__lt=2000)
        if value == "2000_4999":
            return queryset.filter(price__gte=2000, price__lt=5000)
        if value == "gte_5000":
            return queryset.filter(price__gte=5000)
        return queryset


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "price",
        "rating",
        "num_reviews",
        "created_at",
    )
    list_display_links = ("id", "title")
    search_fields = ("title",)
    search_help_text = "Search by product title"  # chhota hint text
    list_filter = (
        "created_at",
        RatingFilter,
        PriceFilter,
    )
    ordering = ("-created_at",)
    list_per_page = 25
