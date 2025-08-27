from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["user_id", "username", "email", "role"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["user_id", "username", "email", "password", "role"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)  

class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if not username or not password:
            raise serializers.ValidationError({"error": "Username and password are required."})

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError({"error": "Invalid username or password."})

        if not user.is_active:
            raise serializers.ValidationError({"error": "User account is inactive."})

        try:
            token = self.get_token(user)
            return {
                "user": UserSerializer(user).data,
                "access_token": str(token.access_token),
                "refresh_token": str(token),
            }
        except Exception as e:
            raise serializers.ValidationError({"error": f"Token generation failed: {str(e)}"})

class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout, requiring a valid refresh token."""
    refresh_token = serializers.CharField()

    def validate(self, attrs):
        refresh_token = attrs.get("refresh_token")

        if not refresh_token:
            raise serializers.ValidationError({"error": "Refresh token is required."})

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            raise serializers.ValidationError({"error": "Invalid or expired token."})

        return {"message": "Successfully logged out"}