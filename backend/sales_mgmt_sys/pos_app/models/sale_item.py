from django.db import models
from .sale import Sale
from .item import Item
from django.core.validators import MinValueValidator

class SaleItem(models.Model):
    sale_item_id = models.AutoField(primary_key=True)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="sale_items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.item.price
        super().save(*args, **kwargs)
        self.sale.update_total() 

    def __str__(self):
        return f"{self.quantity} x {self.item.item_name} in Sale {self.sale.sale_id}"
