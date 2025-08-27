# rating_serializer.py
from rest_framework import serializers
from pos_app.models.rating import Rating
from .user_serializer import UserSerializer

class RatingSerializer(serializers.ModelSerializer):
    """Serializer for ratings"""
    staff = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ["rating_id", "staff", "rating_score", "rating_date"]