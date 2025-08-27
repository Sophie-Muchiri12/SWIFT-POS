from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from pos_app.serializers.user_serializer import UserSerializer, RegisterSerializer, LoginSerializer, LogoutSerializer
from pos_app.permissions import IsManager  
from django.contrib.auth import get_user_model

User = get_user_model()

# Set up logging for debugging
logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    """User Registration View (Only Managers can register users)"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsManager]  

    def create(self, request, *args, **kwargs):
        """Override create method to log errors and return success message"""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"Registration failed: {serializer.errors}")  
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response(
            {
                "message": "User registered successfully",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """User Login View (JWT-based authentication)"""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]  

    def post(self, request, *args, **kwargs):
        """Override POST method to log errors and return JWT tokens"""
        try:
            serializer = self.get_serializer(data=request.data)

            if not serializer.is_valid():
                logger.error(f"Login failed: {serializer.errors}")
                return Response(
                    {"error": "Invalid username or password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Extract validated data
            access_token = serializer.validated_data.get("access_token")
            refresh_token = serializer.validated_data.get("refresh_token")
            user_data = serializer.validated_data.get("user")

            return Response(
                {
                    "user": user_data,
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Unexpected login error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logs out the user by blacklisting their refresh token using LogoutSerializer."""
    serializer = LogoutSerializer(data=request.data)

    if not serializer.is_valid():
        logger.error(f"Logout failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.validated_data, status=status.HTTP_200_OK)
