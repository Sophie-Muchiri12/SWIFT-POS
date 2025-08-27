from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pos_app.models.sale import Sale
from pos_app.models.rating import Rating
from pos_app.permissions import IsCashier, IsSuperuser, IsManager, IsWaiter  

class SalesSummaryView(APIView):
    permission_classes = [IsManager | IsSuperuser]

    def get(self, request):
        return Response({"message": "Sales summary coming soon"})

class SalesHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        if user.role in ["Manager", "Superuser"] or user.user_id == user_id:
            sales = Sale.objects.filter(staff_id=user_id)
            return Response({"sales": sales.count()})

        return Response({"error": "You are not allowed to view this sales history."}, status=403)

class CompletedReturnsView(APIView):
    permission_classes = [IsCashier | IsSuperuser]

    def get(self, request):
        return Response({"message": "Completed returns coming soon"})
