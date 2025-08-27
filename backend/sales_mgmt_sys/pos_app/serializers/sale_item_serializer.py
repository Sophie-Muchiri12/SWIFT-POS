# sale_item_serializer.py
from rest_framework import serializers
from pos_app.models.sale_item import SaleItem

class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer for sale items"""
    item_name = serializers.ReadOnlyField(source="item.item_name")
    price = serializers.ReadOnlyField(source="item.price")

    class Meta:
        model = SaleItem
        fields = ["sale_item_id", "sale", "item", "item_name", "price", "quantity", "subtotal"]