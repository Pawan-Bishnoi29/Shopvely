from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.db import models

from orders.models import Order  # orders_count ke liye


User = get_user_model()

# Pehle default User admin ko unregister karo
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    # Base DjangoUserAdmin ke fields + hamara extra column
    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "orders_count",
        "last_login",
        "date_joined",
    )
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "date_joined",
    )
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

    def get_queryset(self, request):
        # Har user ke saath related orders ka count annotate karein
        qs = super().get_queryset(request)
        return qs.annotate(_orders_count=models.Count("orders"))

    @admin.display(description="Total orders")
    def orders_count(self, obj):
        return getattr(obj, "_orders_count", 0)
