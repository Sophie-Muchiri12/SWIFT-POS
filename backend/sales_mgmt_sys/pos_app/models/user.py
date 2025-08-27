from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.db import models
from django.utils import timezone
from decimal import Decimal
from rest_framework_simplejwt.tokens import RefreshToken

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")
        
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create a superuser with manager role by default."""
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_staff", True)  
        extra_fields.setdefault("is_superuser", True)  
        extra_fields.setdefault("role", "Superuser")  

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("Superuser", "Superuser"),  
        ("Manager", "Manager"),      
        ("Waiter", "Waiter"),        
        ("Cashier", "Cashier"),      
        ("Supervisor", "Supervisor") 
    ]

    user_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True)
    id_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    termination_date = models.DateField(blank=True, null=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) 
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()
    
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username

    def get_tokens(self):
        refresh = RefreshToken.for_user(self)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}

    # Role-based properties for user
    @property
    def is_superuser_role(self):
        return self.role == "Superuser"

    @property
    def is_manager(self):
        return self.role == "Manager"

    @property
    def is_waiter(self):
        return self.role == "Waiter"

    @property
    def is_cashier(self):
        return self.role == "Cashier"

    @property
    def is_supervisor(self):
        return self.role == "Supervisor"
