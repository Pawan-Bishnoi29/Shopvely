from django.contrib import admin
from django.http import HttpResponse
from django.urls import path
from django.utils.html import format_html

import csv
from .models import Order, OrderItem, OrderStatusHistory
from django.template.loader import render_to_string

# Agar later WeasyPrint use karoge to:
# from weasyprint import HTML   # pip install weasyprint
# from django.conf import settings
# import os


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("price",)
    fields = ("product", "quantity", "price")


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    can_delete = False
    readonly_fields = ("old_status", "new_status", "changed_by", "changed_at")
    fields = ("old_status", "new_status", "changed_by", "changed_at")


@admin.action(description="Mark selected orders as Shipped")
def mark_as_shipped(modeladmin, request, queryset):
    for order in queryset:
        old = order.status
        if old != "shipped":
            order.status = "shipped"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order,
                old_status=old,
                new_status="shipped",
                changed_by=request.user,
            )


@admin.action(description="Mark selected orders as Delivered")
def mark_as_delivered(modeladmin, request, queryset):
    for order in queryset:
        old = order.status
        if old != "delivered":
            order.status = "delivered"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order,
                old_status=old,
                new_status="delivered",
                changed_by=request.user,
            )


@admin.action(description="Cancel selected orders")
def cancel_orders(modeladmin, request, queryset):
    for order in queryset:
        old = order.status
        if old != "cancelled":
            order.status = "cancelled"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order,
                old_status=old,
                new_status="cancelled",
                changed_by=request.user,
            )


@admin.action(description="Export selected orders to CSV")
def export_orders_as_csv(modeladmin, request, queryset):
    """
    Simple CSV export of selected orders.
    """
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = "attachment; filename=orders_export.csv"

    writer = csv.writer(response)
    writer.writerow(
        [
            "ID",
            "Customer",
            "Email",
            "Status",
            "Total Amount",
            "Created At",
        ]
    )

    for order in queryset.select_related("user"):
        writer.writerow(
            [
                order.id,
                getattr(order.user, "username", ""),
                getattr(order.user, "email", ""),
                order.status,
                order.total_amount,
                order.created_at,
            ]
        )

    return response


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total_amount", "created_at", "invoice_link")
    list_filter = ("status", "created_at")
    search_fields = ("id", "user__username", "user__email")
    date_hierarchy = "created_at"
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    ordering = ("-created_at",)  # latest orders sabse upar

    actions = [mark_as_shipped, mark_as_delivered, cancel_orders, export_orders_as_csv]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                "<int:order_id>/invoice/",
                self.admin_site.admin_view(self.invoice_view),
                name="orders_order_invoice",
            ),
        ]
        return custom_urls + urls

    def invoice_link(self, obj):
        return format_html(
            '<a href="{}">Download invoice</a>',
            f"{obj.id}/invoice/",
        )

    invoice_link.short_description = "Invoice"

    def invoice_view(self, request, order_id, *args, **kwargs):
        """
        Simple HTML invoice response; later tum isko WeasyPrint se PDF me convert kar sakte ho.
        """
        order = self.get_object(request, order_id)
        html = render_to_string(
            "orders/order_invoice.html",
            {
                "order": order,
                "items": order.items.select_related("product"),
                "user": order.user,
            },
        )
        return HttpResponse(html)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
    search_fields = ("order__id", "product__title")


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("order", "old_status", "new_status", "changed_by", "changed_at")
    list_filter = ("new_status", "changed_by", "changed_at")
    search_fields = ("order__id", "order__user__username", "order__user__email")
    readonly_fields = ("order", "old_status", "new_status", "changed_by", "changed_at")  # ✅ YE ADD KIYA
