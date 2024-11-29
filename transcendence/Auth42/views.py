from django.shortcuts import redirect
from django.conf import settings
import urllib.parse
import secrets
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.contrib.auth import login
from django.http import HttpResponse
from accounts.models import User, VerificationCode
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
import random
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
import jwt


def get_user_from_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user = User.objects.filter(id=payload['user_id']).first()
        return user
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Token expired')
    except jwt.InvalidTokenError:
        raise AuthenticationFailed('Invalid token')

def login_send_mail(email):
    verification_code = random.randint(100000, 999999)
    print(email)
    try:
        send_mail(
            'Login Verification Code',
            f'Your verification code is {verification_code}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return verification_code
    except Exception as e:
        print(f'Error: {e}')
        return 0

class Login42View(APIView):
    def get(self, request):
        url = f"{settings.OAUTH_AUTHORIZE}?client_id={settings.SOCIAL_AUTH_42_KEY}&redirect_uri={settings.REDIRECT_URI}&response_type=code"
        return Response({'url': url})
        
class Callback42View(APIView):
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        token_url = settings.TOKEN_URL
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.SOCIAL_AUTH_42_KEY,
            'client_secret': settings.SOCIAL_AUTH_42_SECRET,
            'code': code,
            'state': state,
            'redirect_uri': settings.REDIRECT_URI,
        }
        token_response = requests.post(token_url, data=data)
            
        if token_response.status_code != 200:
            return Response({'error': 'Failed to obtain access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        access_token = token_response.json().get('access_token')
        refresh_token = token_response.json().get('refresh_token')

        user_url = settings.USER_URL
        headers = {'Authorization': f'Bearer {access_token}'}
        
        user_response = requests.get(user_url, headers=headers)
        
        if user_response.status_code != 200:
            return Response({'error': 'Failed to fetch user info'}, status=status.HTTP_400_BAD_REQUEST)
        user_data = user_response.json()
        user = User.objects.filter(email=user_data.get('email')).first()
        if user is None:
            user_value = User.objects.filter(username=user_data.get('login')).first()
            if user_value is None:
                user = User.objects.create(
                    email=user_data.get('email'),
                    username=user_data.get('login'),
                    name=user_data.get('first_name'),
                    lastname=user_data.get('last_name'),
                    phone = user_data.get('phone'),
                )
            else:
                username = user_data.get('login') + str("_") + str(random.randint(100000, 999999))
                while User.objects.filter(username=username).first():
                    username = user_data.get('login') + str("_") + str(random.randint(100000, 999999))
                user = User.objects.create(
                    email=user_data.get('email'),
                    username=username,
                    name=user_data.get('first_name'),
                    lastname=user_data.get('last_name'),
                    phone = user_data.get('phone'),
                )
        
        login(request, user)
        if user.two_factor_enabled:
            verification = VerificationCode.objects.filter(user=user, used=False, expires_at__gt=timezone.now()).first()
            if not verification or not verification.is_valid():
                verification_code = login_send_mail(user.email)
                if verification_code:
                    verify = VerificationCode.objects.create(user=user, code=verification_code)
                    verify.save()
                else:
                    return Response({'error': 'Mail not sent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({
                'success': True,
                'twoFactor': True,
                'username': user.username,
            }, status=status.HTTP_200_OK)
        else:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'username': user.username,
                'refresh_token': str(refresh),
                'access_token': str(refresh.access_token),
                'twoFactor': False,
            }, status=status.HTTP_200_OK)