# item_serializer.py
from rest_framework import serializers
from pos_app.models.item import Item

class ItemSerializer(serializers.ModelSerializer):
    """Serializer for fetching items"""
    class Meta:
        model = Item
        fields = ["item_id", "item_name", "price", "quantity", "is_active", "created_at", "updated_at"]