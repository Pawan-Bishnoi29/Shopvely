from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db import transaction

from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from products.models import Product
from orders.models import Order, OrderItem
from addresses.models import Address


def get_or_create_cart(request):
    """
    Logged-in user ke liye: user-specific cart.
    """
    user = request.user
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    # Ab cart sirf authenticated users ke liye
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Add or update item:
        {
          "product_id": 1,
          "quantity": 2
        }
        """
        cart = get_or_create_cart(request)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update quantity:
        {
          "item_id": 5,
          "quantity": 3
        }
        """
        cart = get_or_create_cart(request)
        item_id = request.data.get("item_id")
        quantity = int(request.data.get("quantity", 1))

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        """
        Remove item:
        {
          "item_id": 5
        }
        """
        cart = get_or_create_cart(request)
        item_id = request.data.get("item_id")

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckoutView(APIView):
    """
    POST /api/cart/checkout/
    {
      "address_id": 1
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        address_id = request.data.get("address_id")

        if not address_id:
            return Response(
                {"detail": "address_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # cart lo
        cart = get_or_create_cart(request)
        items = cart.items.select_related("product")
        if not items.exists():
            return Response(
                {"detail": "Cart is empty"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # address verify
        try:
            address = Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            return Response(
                {"detail": "Address not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # order create with shipping snapshot
        order = Order.objects.create(
            user=user,
            shipping_full_name=address.full_name,
            shipping_phone=address.phone,
            shipping_line1=address.line1,
            shipping_line2=address.line2,
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_pincode=address.pincode,
        )

        # cart items -> order items
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )

        # total auto update ho jayega OrderItem.save() se

        # cart clear
        items.delete()

        return Response(
            {"detail": "Order created", "order_id": order.id},
            status=status.HTTP_201_CREATED,
        )
