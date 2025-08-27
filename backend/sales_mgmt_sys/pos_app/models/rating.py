from django.db import models
from django.utils import timezone
from .user import User

class Rating(models.Model):
    rating_id = models.AutoField(primary_key=True)
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings_received")
    rating_score = models.FloatField()
    rating_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Rating {self.rating_score} for {self.staff.username}"

