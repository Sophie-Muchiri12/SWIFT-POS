from django.db import models
from django.utils import timezone
from decimal import Decimal
from django.core.validators import MinValueValidator
from .user import User

class Sale(models.Model):
    sale_id = models.AutoField(primary_key=True)
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sales")
    sale_date = models.DateField(default=timezone.now)
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_total(self):
        """Recalculate total amount based on sale items."""
        total = sum(item.subtotal for item in self.sale_items.all())
        self.total_amount = total if total else Decimal("0.00")
        self.save()

    def __str__(self):
        return f"Sale {self.sale_id} by {self.staff.username}"
