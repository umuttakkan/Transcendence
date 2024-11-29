from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import User, VerificationCode
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
import re
from django.core.validators import RegexValidator

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        request = self.context.get('request')
        user = authenticate(request, username=email, password=password)
        if user is None:
            raise ValidationError('Invalid email or password')
        return user

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=128, write_only=True)
    confirm_password = serializers.CharField(max_length=128, write_only=True)
    phone = serializers.CharField(
        max_length=10,
        min_length=10,
        validators=[RegexValidator(regex=r'^\d{10}$', message="Phone number must be exactly 10 digits.")]
    )
    class Meta:
        model = User
        fields = ['name', 'lastname', 'username', 'email', 'phone', 'password', 'confirm_password']
    
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if password != confirm_password:
            raise ValidationError('Passwords do not match')
        if len(password) < 8:
            raise ValidationError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in password):
            raise ValidationError('Password must contain at least one digit')
        if not any(char.isupper() for char in password):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in password):
            raise ValidationError('Password must contain at least one lowercase letter')

        email = data.get('email')
        if email and re.search(r'@student\.42.*\.\w{2,}$', email):
            raise ValidationError('Registration is not allowed with a @student.42... email address reserved for 42 students.')        
        return data
    
    def create(self, validated_data):
        confirm_password = validated_data.pop('confirm_password', None)
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            lastname=validated_data['lastname'],
            username=validated_data['username'],
            password=validated_data['password'],
            phone=validated_data.get('phone')
        )

class VerificationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationCode
        fields = ['code']
    
    def validate(self, data):
        code = data.get('code')
        if len(code) != 6 or not code.isdigit():
            raise ValidationError('Invalid verification code')
        return data

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'lastname', 'username', 'email', 'phone']