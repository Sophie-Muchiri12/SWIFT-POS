from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Item, Sale, SaleItem, Rating

admin.site.site_header = "Kali Coffee Dashboard"  
admin.site.site_title = "Kali Coffee Admin" 
admin.site.index_title = "Manage Kali Coffee System" 

# Custom User Creation Form
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'email', 'role', 'id_number', 'phone_number', 'hire_date', 'termination_date', 'is_staff', 'is_active')

# Custom User Change Form
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'email', 'role', 'id_number', 'phone_number', 'hire_date', 'termination_date', 'is_staff', 'is_active')

# User Admin
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    # FIXED: Removed 'password' from list_display
    list_display = ['first_name', 'last_name', 'username', 'email', 'role', 'id_number', 'phone_number', 'hire_date', 'is_staff', 'is_active']
    list_filter = ("is_staff", "is_active", "role")
    
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "phone_number", "id_number", "hire_date", "termination_date")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "role")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "first_name", "last_name", "username", "email", "role",
                "id_number", "phone_number", "hire_date", "termination_date",
                "password1", "password2", "is_staff", "is_active"
            ),
        }),
    )

    search_fields = ("username", "email")
    ordering = ("username",)

    # FIXED: Proper save_model method
    def save_model(self, request, obj, form, change):
        if not change:  # If creating a new user
            if form.cleaned_data.get("password1"):
                obj.set_password(form.cleaned_data["password1"])
        super().save_model(request, obj, form, change)

# Item Admin
class ItemAdmin(admin.ModelAdmin):
    list_display = ["item_name", "price", "quantity", "created_at"]

# Sale Item Admin
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ["item", "sale", "quantity", "subtotal"]

# Rating Admin
class RatingAdmin(admin.ModelAdmin):
    list_display = ["staff", "rating_score", "rating_date"]

# Sale Admin
class SaleAdmin(admin.ModelAdmin):
    list_display = ["staff", "sale_date", "total_amount", "created_at"]

# Register models
admin.site.register(User, UserAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Sale, SaleAdmin)
admin.site.register(SaleItem, SaleItemAdmin)
admin.site.register(Rating, RatingAdmin)