from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pos_app.models.item import Item
from pos_app.models.sale import Sale
from pos_app.serializers.item_serializer import ItemSerializer
from pos_app.serializers.sale_serializer import SaleUpdateSerializer
from pos_app.permissions import IsManager, IsSuperuser  

class ItemListCreateView(generics.ListCreateAPIView):
    queryset = Item.objects.filter(is_active=True)
    serializer_class = ItemSerializer

    def get_permissions(self):
        """
        - All authenticated users can view items (GET request).
        - Only Managers & Superusers can create new items (POST request).
        """
        if self.request.method == "POST":
            return [IsManager() | IsSuperuser()]
        return [IsAuthenticated()]
class ItemDetailView(generics.RetrieveUpdateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsManager | IsSuperuser]  

class ReduceStockView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id, *args, **kwargs):
        """Reduce stock quantity when a sale is made"""
        try:
            item = Item.objects.get(id=item_id)
            quantity_sold = request.data.get("quantity", 0)

            if not isinstance(quantity_sold, int) or quantity_sold <= 0:
                return Response({"error": "Invalid quantity"}, status=status.HTTP_400_BAD_REQUEST)

            if item.quantity < quantity_sold:
                return Response({"error": "Insufficient stock"}, status=status.HTTP_400_BAD_REQUEST)

            item.quantity -= quantity_sold
            item.save()

            return Response({"message": "Stock updated successfully"}, status=status.HTTP_200_OK)

        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
