from django.urls import path
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from pos_app.views.auth_views import RegisterView, LoginView, logout_view
from pos_app.views.item_views import ItemListCreateView, ItemDetailView, ReduceStockView
from pos_app.views.sale_views import SaleListCreateView, SaleEditView, UpdateItemQuantityView, update_sales, delete_sale, UpdateSaleTotalView
from pos_app.views.report_views import SalesSummaryView, SalesHistoryView, CompletedReturnsView
from pos_app.views.rating_views import StaffRatingsView

def api_home(request):
    return JsonResponse({
        "message": "Sales Management System API",
        "status": "running",
        "endpoints": {
            "admin": "/admin/",
            "login": "/v1/login/",
            "register": "/v1/register/",
            "items": "/v1/items/",
            "sales": "/v1/sales/",
            "reports": "/v1/sales/summary/"
        }
    })

urlpatterns = [
    # API Home
    path("", api_home, name="api_home"),
    
    # Authentication Routes
    path("v1/login/", LoginView.as_view(), name="login"),
    path("v1/register/", RegisterView.as_view(), name="register"),
    path("v1/logout/", logout_view, name="logout"),
    path("v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Item Management
    path("v1/items/", ItemListCreateView.as_view(), name="items"),
    path("v1/items/<int:pk>/", ItemDetailView.as_view(), name="item_detail"),
    path("v1/items/<int:item_id>/reduce-stock/", ReduceStockView.as_view(), name="reduce_stock"),  

    # Sales Management
    path("v1/sales/", SaleListCreateView.as_view(), name="sales"),
    path('v1/update-item-quantity/', UpdateItemQuantityView.as_view(), name='update-item-quantity'),
    path("v1/sales/<int:pk>/edit/", SaleEditView.as_view(), name="sale_edit"),
    path("v1/sales/<int:sale_id>/delete/", delete_sale, name="sale_delete"),
    path('v1/update-sales/', update_sales, name='update-sales'),
    path("v1/sales/<int:sale_id>/update-total/", UpdateSaleTotalView.as_view(), name="update_sale_total"),  

    # Sales Reports & History
    path("v1/sales/history/<int:user_id>/", SalesHistoryView.as_view(), name="sales_history"),
    path("v1/sales/returns/", CompletedReturnsView.as_view(), name="completed_returns"),
    path("v1/sales/summary/", SalesSummaryView.as_view(), name="sales_summary"),
    
    # Staff Ratings
    path("v1/staff/ratings/", StaffRatingsView.as_view(), name="staff_ratings"),
]