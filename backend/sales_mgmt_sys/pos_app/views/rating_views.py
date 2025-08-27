from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from pos_app.models.rating import Rating
from pos_app.serializers.rating_serializer import RatingSerializer
from pos_app.permissions import IsManager, IsSuperuser  

class StaffRatingsView(generics.ListAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsManager | IsSuperuser]
