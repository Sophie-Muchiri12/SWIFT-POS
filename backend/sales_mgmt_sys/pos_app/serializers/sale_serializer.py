from decimal import Decimal
from rest_framework import serializers
from pos_app.models.sale import Sale
from pos_app.models.sale_item import SaleItem
from pos_app.models.item import Item  


# Serializer for individual sale items
class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['item', 'quantity', 'subtotal']  
        read_only_fields = ['subtotal']   

class SaleSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True)  

    class Meta:
        model = Sale
        fields = ['staff', 'sale_items']

    def create(self, validated_data):
        sale_items_data = validated_data.pop('sale_items')  
        sale = Sale.objects.create(**validated_data)  

        for item_data in sale_items_data:
            SaleItem.objects.create(sale=sale, **item_data)  
        
        sale.update_total()  
        return sale
class SaleUpdateSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True)  

    class Meta:
        model = Sale
        fields = ["sale_id", "total_amount", "sale_items"]
        read_only_fields = ["staff", "sale_date"]

    def update(self, instance, validated_data):
        sale_items_data = validated_data.pop("sale_items", [])

        for sale_item_data in sale_items_data:
            item = sale_item_data["item"]
            quantity = sale_item_data["quantity"]

            if item.quantity < quantity:
                raise serializers.ValidationError(
                    {"error": f"Not enough stock for {item.item_name}. Only {item.quantity} available."}
                )

            item.quantity -= quantity
            item.save()

            sale_item, created = SaleItem.objects.update_or_create(
                sale=instance, item=item, defaults={"quantity": quantity, "price": sale_item_data["price"]}
            )

        instance.update_total()
        return instance
class SaleCreateSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True, write_only=True)

    class Meta:
        model = Sale
        fields = ["sale_id", "staff", "total_amount", "sale_items"]
        read_only_fields = ["sale_id", "staff", "sale_date"]

    def validate_total_amount(self, value):
        """Ensure total_amount is a valid decimal and not negative."""
        if value is None or value < Decimal("0.01"):
            raise serializers.ValidationError("Total amount must be at least 0.01.")
        return value

    def create(self, validated_data):
        sale_items_data = validated_data.pop("sale_items")

        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["staff"] = request.user

        sale = Sale.objects.create(**validated_data)

        for sale_item_data in sale_items_data:
            item = sale_item_data["item"]
            quantity = sale_item_data["quantity"]

            if item.quantity < quantity:
                raise serializers.ValidationError(
                    {"error": f"Not enough stock for {item.item_name}. Only {item.quantity} available."}
                )
                
            item.quantity -= quantity
            item.save()

            SaleItem.objects.create(sale=sale, **sale_item_data)

        sale.update_total()

        return sale
