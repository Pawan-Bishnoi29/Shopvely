from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Product, Wishlist
from .serializers import ProductSerializer, WishlistSerializer


class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class WishlistView(generics.GenericAPIView):
    """
    GET    /api/products/wishlist/            -> current user's wishlist
    POST   {"product_id": id}                -> add product
    DELETE {"product_id": id}                -> remove product
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WishlistSerializer

    def get_object(self):
        wishlist, _ = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get(self, request, *args, **kwargs):
        wishlist = self.get_object()
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        wishlist = self.get_object()
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"detail": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if product in wishlist.products.all():
            return Response(
                {"detail": "Product already in wishlist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wishlist.products.add(product)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        wishlist = self.get_object()
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"detail": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if product not in wishlist.products.all():
            return Response(
                {"detail": "Product not in wishlist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        wishlist.products.remove(product)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)
