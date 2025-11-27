from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import render_to_string

from .models import Order, OrderItem, OrderStatusHistory
from .serializers import OrderSerializer, OrderStatusUpdateSerializer
from cart.models import Cart, CartItem  # tumhara cart app


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # sirf current user ke orders
        return Order.objects.filter(user=self.request.user)


class OrderStatusUpdateView(generics.UpdateAPIView):  # ✅ NEW
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    # OPTIONAL: yahi pe history create kar sakte ho agar chaho.


class OrderInvoiceView(generics.GenericAPIView):
    """
    Logged-in user ke liye HTML invoice view (same template jo admin use kar raha hai).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        # ensure user sirf apne hi order ka invoice dekh sakta hai
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        html = render_to_string(
            "orders/order_invoice.html",
            {
                "order": order,
                "items": order.items.select_related("product"),
                "user": order.user,
            },
        )
        return HttpResponse(html)
