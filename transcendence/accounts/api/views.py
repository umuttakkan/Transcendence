import jwt
from rest_framework.generics import GenericAPIView
from accounts.api.serializers import LoginSerializer, RegistrationSerializer, VerificationCodeSerializer, ProfileSerializer, TokenRefreshSerializer
from accounts.models import User, VerificationCode
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView

from django.contrib.auth import login as django_login
from django.contrib.auth import logout
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone

import requests

from django.shortcuts import render
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
import json

class RegistrationAPIView(generics.CreateAPIView):
    queryset = None
    serializer_class = RegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success registration'}, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(generics.CreateAPIView):
    queryset = None
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data
            
            # access_token = create_access_token(user)
            # refresh_token = create_refresh_token(user)
            refresh_token = RefreshToken.for_user(user)
            access_token = refresh_token.access_token
            verification = VerificationCode.objects.filter(user=user, used=False, expires_at__gt=timezone.now()).first()
            
            django_login(request, user)

            if verification and verification.is_valid():
                verification_code = verification.get_code()
                print('Verification code is valid')
                print(verification_code)
            else:
                print('Verification code is not valid')
                response = requests.post("http://localhost:8000/twoFactor/sendMail/", json={'email': user.email})
                if response.status_code == 200:
                    verification_code = response.json().get('verification_code')
                    user_data = get_object_or_404(User, email=user.email)
                    verify = VerificationCode.objects.create(user=user_data, code=verification_code)
                    verify.save()
                    print(verification_code)
                    print("asd")
                else:
                    return Response({'error': 'Mail not sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            return Response({
                'refresh_token': str(refresh_token),
                'access_token': str(access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class VerifyAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = None
    serializer_class = VerificationCodeSerializer
    print("girdi123213")
    def post(self, request):
        print("girdi1111")
        serializer = self.serializer_class(data=request.data)
        print(serializer)
        if serializer.is_valid():
            user_data = serializer.validated_data
            code = user_data['code']
            print(f"Received code: {code}")
            verification = VerificationCode.objects.filter(code=code, used=False, expires_at__gt=timezone.now()).first()
            
            print(f"Verification object: {verification}")
            if verification:
                if verification.is_valid():
                    print("girdi2")
                    verification.used = True
                    verification.save()
                    return Response({'message': 'Success login'})
                return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Code not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    print("ProfileAPIView.get çağrıldı")

    def get(self, request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Authorization header not found'}, status=status.HTTP_400_BAD_REQUEST)
        print("get içindeyim")
        if auth_header is None:
            return Response({'error': 'Authorization header not found'}, status=status.HTTP_400_BAD_REQUEST)
        print("buradayim")
        try:
            print("giridm")
            access_token = auth_header.split(' ')[1]
            payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.filter(id=payload['user_id']).first()
            if user is None:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({
                'name': user.name,
                'lastname': user.lastname,
                'username': user.username,
                'email': user.email,
                'phone': user.phone
            }, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutAPIView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = None
    serializer_class = None

    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            logout(request)
            response = Response({'message': 'Success logout'}, status=status.HTTP_200_OK)
            response.delete_cookie('sessionid')
            return response
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)