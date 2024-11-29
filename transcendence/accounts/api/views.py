import jwt
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from accounts.models import User, VerificationCode
from accounts.api.serializers import (
    LoginSerializer,
    RegistrationSerializer,
    VerificationCodeSerializer,
    ProfileSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import login, logout
import random
import json
from rest_framework_simplejwt.views import TokenRefreshView
from Pong.models import Match, GamePlayHistory
from django.db.models import Q

def login_send_mail(email):
    verification_code = random.randint(100000, 999999)
    try:
        send_mail(
            'Login Verification Code',
            f'Your verification code is {verification_code} (valid for 10 minutes)',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return verification_code
    except Exception as e:
        print(f'Email sending failed for {email}: {e}')
        return 0


def validate_verification_code(code):
    verification = VerificationCode.objects.filter(code=code, used=False, expires_at__gt=timezone.now()).first()
    if verification and verification.is_valid():
        verification.mark_as_used()
        return verification.user
    return None


def get_user_from_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user = User.objects.filter(id=payload['user_id']).first()
        return user
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token')


class RegistrationAPIView(CreateAPIView):
    serializer_class = RegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Success registration'}, status=201)
        return Response({'error': serializer.errors}, status=400)


class LoginAPIView(CreateAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data
            if user.two_factor_enabled:
                verification = VerificationCode.objects.filter(user=user, used=False, expires_at__gt=timezone.now()).first()
                if not verification or not verification.is_valid():
                    verification_code = login_send_mail(user.email)
                    if verification_code == 0:
                        return Response({'error': 'Mail not sent'}, status=500)
                    VerificationCode.objects.create(user=user, code=verification_code)
                login(request, user)
                return Response({'username': user.username, 'twoFa': True}, status=200)
            else:
                refresh_token = RefreshToken.for_user(user)
                access_token = refresh_token.access_token
                login(request, user)
                return Response({
                    'refresh_token': str(refresh_token),
                    'access_token': str(access_token)
                }, status=200)
        return Response({'error': serializer.errors}, status=400)


class VerifyAPIView(CreateAPIView):
    serializer_class = VerificationCodeSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data['code']
            user = validate_verification_code(code)
            if user:
                user.save()
                refresh_token = RefreshToken.for_user(user)
                access_token = refresh_token.access_token
                return Response({
                    'message': 'Success login',
                    'refresh_token': str(refresh_token),
                    'access_token': str(access_token)
                }, status=200)
            return Response({'error': 'Invalid or expired code'}, status=400)
        return Response({'error': 'Invalid data'}, status=400)

class ProfileAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get(self, request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1] if auth_header else None
        user = get_user_from_token(token)
        if user:
            return Response({
                'name': user.name,
                'lastname': user.lastname,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'twoFa': user.two_factor_enabled
            }, status=200)
        return Response({'error': 'User not found'}, status=404)

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh_token')
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                    pass
            if request.user and not request.user.is_anonymous:
                request.user.save()
            logout(request)
            request.session.flush()
            response = Response({
                'message': 'Başarıyla çıkış yapıldı.'
            }, status=200)
            response.delete_cookie('sessionid')
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            print(f"Logout error: {str(e)}") 
            return Response({
                'error': 'Çıkış işlemi sırasında bir hata oluştu.'
            }, status=400)

class ResetCodeAPIView(APIView):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        user = User.objects.filter(username=username).first()
        verification = VerificationCode.objects.filter(
            user=user, 
            used=False, 
            expires_at__gt=timezone.now()
        ).first()
        if verification:
            verification.used = True
            verification.save()
        verification_code = login_send_mail(user.email)
        if verification_code == 0:
            return Response({'error': 'Mail not sent'}, status=400)
        VerificationCode.objects.create(user=user, code=verification_code)
        return Response({'message': 'Verification code sent'}, status=200)

class TwoFactorUpdateAPIView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def put(self, request, *args, **kwargs):
        user = request.user
        twoFa = request.data.get('twoFa')
        user.two_factor_enabled = twoFa
        user.save()
        return Response({'message': 'Two factor authentication updated'}, status=200)


class DeleteAPIView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        username = user.username

        matches = Match.objects.filter(
            Q(winnerName=username) | Q(loserName=username)
        )
        GamePlayHistory.objects.filter(match__in=matches).delete()
        matches.delete()
        user.delete()
        return Response({'message': 'User deleted'}, status=200)

