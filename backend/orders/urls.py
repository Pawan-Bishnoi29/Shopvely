from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    OrderStatusUpdateView,  # ✅ status change
    OrderInvoiceView,       # ✅ user invoice
)

urlpatterns = [
    path("", OrderListCreateView.as_view(), name="order-list-create"),           # list + create orders
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),           # single order detail
    path("<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),  # status change
    path("<int:pk>/invoice/", OrderInvoiceView.as_view(), name="order-invoice"),            # user invoice
]
