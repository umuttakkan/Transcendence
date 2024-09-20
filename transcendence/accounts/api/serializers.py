from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import User, VerificationCode
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password

class LoginSerializer(serializers.Serializer):
    # username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        # username = data.get('username')
        email = data.get('email')
        
        password = data.get('password')
        print(password)
        # print(username)
        request = self.context.get('request')
        # user_data = User.objects.filter(username=email).first()
        # print(user_data.username)
        # print(user_data.check_password(password))
        user = authenticate(request, username=email, password=password)
        print(user)
        if user is None:
            raise ValidationError('Invalid username or password')
        return user

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=100, write_only=True)
    confirm_password = serializers.CharField(max_length=100, write_only=True)
    
    class Meta:
        model = User
        fields = ['name', 'lastname', 'username', 'email', 'phone', 'password', 'confirm_password']
    
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if password != confirm_password:
            raise ValidationError('Passwords do not match')
        return data
    
    def create(self, validated_data):
        print("register save calistir")
        confirm_password = validated_data.pop('confirm_password', None)
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            lastname=validated_data['lastname'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone=validated_data.get('phone')  # Eğer phone opsiyonelse
        )

class VerificationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationCode
        fields = ['code']
    
    def validate(self, data):
        code = data.get('code')
        print(code)
        if len(code) != 6:
            raise ValidationError('Invalid verification code')
        return data

class TokenRefreshSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'lastname', 'username', 'email', 'phone']