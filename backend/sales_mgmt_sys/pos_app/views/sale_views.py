from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from pos_app.models.sale import Sale
from pos_app.models.item import Item  
from pos_app.serializers.sale_serializer import SaleSerializer, SaleUpdateSerializer
class CanCreateSalePermission(BasePermission):
    """Only Waiters, Managers, Cashiers, and Supervisors can create sales (Superusers always allowed)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ["Waiter", "Manager", "Cashier", "Supervisor"]
        )


class CanEditSalePermission(BasePermission):
    """Only Cashiers, Managers, and Supervisors can edit sales (Superusers always allowed)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ["Cashier", "Manager", "Supervisor", "Waiter"]
        )


class CanDeleteSalePermission(BasePermission):
    """Only Managers and Supervisors can delete sales (Superusers always allowed)"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or request.user.role in ["Manager", "Supervisor"]
        )

class SaleListCreateView(generics.ListCreateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def get_permissions(self):
        """All authenticated users can view sales, but only certain roles can create them."""
        if self.request.method == "POST":
            return [CanCreateSalePermission()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        sale = serializer.save()
                
    def create(self, request, *args, **kwargs):
        print("Received Data:", request.data)  
        serializer = self.get_serializer(data=request.data)
    
        if not serializer.is_valid():
            print("Serializer Errors:", serializer.errors) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

class SaleEditView(generics.UpdateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleUpdateSerializer
    permission_classes = [CanEditSalePermission]

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

@api_view(["DELETE"])
@permission_classes([CanDeleteSalePermission])
def delete_sale(request, sale_id):
    try:
        sale = Sale.objects.get(sale_id=sale_id)
        sale.delete()
        return Response({"message": "Sale deleted successfully"}, status=status.HTTP_200_OK)
    except Sale.DoesNotExist:
        return Response({"error": "Sale not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
@permission_classes([CanEditSalePermission])
def update_sales(request):
    print("Raw Request Data:", request.data) 

    sold_items = request.data.get("sale_items", [])

    if not isinstance(sold_items, list) or not sold_items:
        return Response({"error": "Invalid or missing sale_items"}, status=400)

    try:
        with transaction.atomic(): 
            for sale_item in sold_items:
                print("Processing Sale Item:", sale_item)  
                
                item_id = sale_item.get("item")
                quantity_sold = sale_item.get("quantity", 0)

                if not item_id or quantity_sold <= 0:
                    return Response({"error": "Invalid item data"}, status=400)

                item = Item.objects.filter(item_id=item_id).first()
                if not item:
                    return Response({"error": f"Item ID {item_id} not found"}, status=404)

                if item.quantity < quantity_sold:
                    return Response({"error": f"Not enough stock for {item.item_name}"}, status=400)

                item.quantity -= quantity_sold
                item.save()

        return Response({"message": "Stock updated successfully"}, status=200)

    except Exception as e:
        print("Unexpected Error:", str(e)) 
        return Response({"error": "Something went wrong. Please try again."}, status=500)

@api_view(["PATCH"])
@permission_classes([CanEditSalePermission])
def update_total_amount(request, sale_id):
    try:
        sale = Sale.objects.get(sale_id=sale_id)
        amount_sold = request.data.get("amount_sold", 0)

        if not isinstance(amount_sold, (int, float)) or amount_sold <= 0:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        sale.total_amount += amount_sold
        sale.save()

        return Response({"message": "Total amount updated successfully"}, status=status.HTTP_200_OK)

    except Sale.DoesNotExist:
        return Response({"error": "Sale not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateSaleTotalView(UpdateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleUpdateSerializer
    permission_classes = [CanEditSalePermission]

    def put(self, request, sale_id, *args, **kwargs):
        """Increase total amount of a sale"""
        try:
            sale = Sale.objects.get(sale_id=sale_id)
            amount_to_add = request.data.get("amount", 0)

            if not isinstance(amount_to_add, (int, float)) or amount_to_add <= 0:
                return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

            sale.total_amount += amount_to_add
            sale.save()

            return Response({"message": "Sale total amount updated successfully"}, status=status.HTTP_200_OK)

        except Sale.DoesNotExist:
            return Response({"error": "Sale not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateItemQuantityView(APIView):
    """
    API endpoint to update item quantity after a sale.
    """
    def post(self, request, *args, **kwargs):
        serializer = SaleSerializer(data=request.data)
        
        if serializer.is_valid():
            sale_data = serializer.validated_data
            items_sold = sale_data.get('items', [])  
            
            for item_data in items_sold:
                item_id = item_data.get('item_id')
                quantity_sold = item_data.get('quantity')

                item = get_object_or_404(Item, id=item_id)

                if item.stock >= quantity_sold:
                    item.stock -= quantity_sold
                    item.save()
                else:
                    return Response(
                        {"error": f"Not enough stock for item {item.name}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            return Response({"message": "Stock updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
