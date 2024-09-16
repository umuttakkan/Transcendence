import jwt
from rest_framework.generics import GenericAPIView
from accounts.api.serializers import LoginSerializer, RegistrationSerializer, VerificationCodeSerializer, ProfileSerializer
from accounts.models import User, VerificationCode
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from datetime import datetime, timedelta
from rest_framework.views import APIView

from django.contrib.auth import login as django_login
from rest_framework import status
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
import random
import requests 
from django.shortcuts import render
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated

def create_access_token(user):
    return jwt.encode({
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(minutes=60),
        'iat': datetime.utcnow()
    },
        settings.SECRET_KEY,
        algorithm='HS256'
    )

def create_refresh_token(user):
    return jwt.encode({
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    },
        settings.SECRET_KEY,
        algorithm='HS256'
    )

def login_send_mail(user):
    verification_code = random.randint(100000, 999999)
    try:
        send_mail(
            'Login Verification Code',
            f'Your verification code is {verification_code}',
            settings.EMAIL_HOST_USER,
            [user['email']],
            fail_silently=False,
        )
        return verification_code
    except Exception as e:
        print(f'Error: {e}')
        return 0

class RegistrationAPIView(generics.CreateAPIView):
    queryset = None
    serializer_class = RegistrationSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            user = User.objects.create(
                name=user_data['name'],
                lastname=user_data['lastname'],
                username=user_data['username'],
                email=user_data['email'],
                phone=user_data['phone'],
                password=user_data['password'],
                confirm_password=user_data['confirm_password']
            )
            return Response({'message': 'Success registration'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        

# class LoginAPIView(generics.CreateAPIView):
#     queryset = None
#     serializer_class = LoginSerializer

#     def post(self, request):
#         serializer = self.serializer_class(data=request.data)
#         if serializer.is_valid():
#             user_data = serializer.validated_data
            
#             access_token = create_access_token(user_data)
            
#             refresh_token = create_refresh_token(user_data)
            
#             user = get_object_or_404(User, email=user_data['email'])
            
#             verification = VerificationCode.objects.filter(user=user, used=False, expires_at__gt=timezone.now()).first()
            
#             login(request, user)
#             if verification and verification.is_valid():
#                 verification_code = verification.get_code()
#                 print('Verification code is valid')
#                 print(verification_code)
#             else:
#                 print('Verification code is not valid')
#                 verification_code = login_send_mail(user_data)
#                 print(verification_code)
#                 if verification_code:
#                     verify = VerificationCode.objects.create(user=user, code=verification_code)
#                     verify.save()
#                 else:
#                     return Response({'error': 'Mail not sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#             return Response({
#                 'refresh': str(refresh_token),
#                 'access': str(access_token),
#             })
#         return Response({'error': 'Invalid data'} ,status=status.HTTP_400_BAD_REQUEST)
class LoginAPIView(generics.CreateAPIView):
    queryset = None
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            user = user_data['user']
            
            access_token = create_access_token(user)
            refresh_token = create_refresh_token(user)
            
            verification = VerificationCode.objects.filter(user=user, used=False, expires_at__gt=timezone.now()).first()
            
            django_login(request, user)

            if verification and verification.is_valid():
                verification_code = verification.get_code()
                print('Verification code is valid')
                print(verification_code)
            else:
                print('Verification code is not valid')
                verification_code = login_send_mail(user_data)
                print(verification_code)
                if verification_code:
                    verify = VerificationCode.objects.create(user=user, code=verification_code)
                    verify.save()
                else:
                    return Response({'error': 'Mail not sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            return Response({
                'refresh': str(refresh_token),
                'access': str(access_token),
            }, status=status.HTTP_200_OK)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class VerifyAPIView(generics.CreateAPIView):
    queryset = None
    serializer_class = VerificationCodeSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            verification = VerificationCode.objects.filter(code=user_data['code'], used=False, expires_at__gt=timezone.now()).first()
            if verification and verification.is_valid():
                verification.used = True
                verification.save()
                return Response({'message': 'Success login'})
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'pk'
