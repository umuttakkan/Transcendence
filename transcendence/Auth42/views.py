from django.shortcuts import redirect
from django.conf import settings
import urllib.parse
import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.http import HttpResponse
from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class Login42View(APIView):
    def get(self, request):
        url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.SOCIAL_AUTH_42_KEY}&redirect_uri=http://localhost:8000/ft_login/&response_type=code"
        return Response({'url': url})
        
class Callback42View(APIView):
    def get(self, request):
        code = request.GET.get('code')
        state = request.GET.get('state')

        token_url = 'https://api.intra.42.fr/oauth/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.SOCIAL_AUTH_42_KEY,
            'client_secret': settings.SOCIAL_AUTH_42_SECRET,
            'code': code,
            'state': state,
            'redirect_uri': 'http://localhost:8000/ft_login/',
        }
        token_response = requests.post(token_url, data=data)
            
        if token_response.status_code != 200:
            return Response({'error': 'Failed to obtain access token'}, status=status.HTTP_400_BAD_REQUEST)
        
        access_token = token_response.json().get('access_token')
        refresh_token = token_response.json().get('refresh_token')

        user_url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        
        user_response = requests.get(user_url, headers=headers)
        
        if user_response.status_code != 200:
            return Response({'error': 'Failed to fetch user info'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = user_response.json()
        user = User.objects.filter(email=user_data.get('email')).first()
        if user:
            user.delete()
        user = User.objects.create(
            email=user_data.get('email'),
            username=user_data.get('login'),
            name=user_data.get('first_name'),
            lastname=user_data.get('last_name'),
            phone = user_data.get('phone'),
            # avatar=user_data.get('image_url'),
        )
        refreshToken = RefreshToken.for_user(user)
        accessToken = refreshToken.access_token

        return Response({
            'success': True,
            'message': 'Authentication successful',
            'access_token': str(accessToken),
            'refresh_token': str(refreshToken),
        })
        
        
# 'user': {
#                 'id': user_data.get('id'),
#                 'email': user_data.get('email'),
#                 'login': user_data.get('login'),
#                 'first_name': user_data.get('first_name'),
#                 'last_name': user_data.get('last_name'),
#                 'url': user_data.get('url'),
#                 'avatar': user_data.get('image_url'),
#             },