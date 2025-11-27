from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Address
from .serializers import AddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/addresses/          -> current user ke sab addresses
    POST /api/addresses/          -> naya address create
    """

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/addresses/<id>/   -> ek address
    PUT    /api/addresses/<id>/   -> full update
    PATCH  /api/addresses/<id>/   -> partial update
    DELETE /api/addresses/<id>/   -> delete
    """

    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class SetDefaultAddressView(APIView):
    """
    POST /api/addresses/<id>/set-default/
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
        except Address.DoesNotExist:
            return Response(
                {"detail": "Address not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # pehle sab se default hatao, phir isko default karo
        Address.objects.filter(user=request.user, is_default=True).update(
            is_default=False
        )
        address.is_default = True
        address.save(update_fields=["is_default"])

        serializer = AddressSerializer(address)
        return Response(serializer.data, status=status.HTTP_200_OK)
