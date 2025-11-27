from rest_framework import serializers
from .models import Product, Wishlist


class ProductSerializer(serializers.ModelSerializer):
    is_in_wishlist = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_is_in_wishlist(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                wishlist = Wishlist.objects.get(user=request.user)
                return obj in wishlist.products.all()
            except Wishlist.DoesNotExist:
                return False
        return False


class WishlistSerializer(serializers.ModelSerializer):
    # yahan ProductSerializer use kar rahe hain, context ko view se pass karenge
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ("id", "products", "created_at", "updated_at")
