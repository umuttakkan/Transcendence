from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import User, VerificationCode
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = User.objects.filter(email=email).first()
        print(user.email)
        print(user.password)
        if user is None:
            raise serializers.ValidationError('Invalid email or password')

        data['user'] = user
        return data

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class VerificationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationCode
        fields = ['code']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'lastname', 'username', 'email', 'phone']