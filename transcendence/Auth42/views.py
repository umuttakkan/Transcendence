from django.shortcuts import render
from django.conf import settings
import urllib.parse
import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

class Login42APIView(APIView):
    def get(self, request):

        authorize_url = 'https://api.intra.42.fr/oauth/authorize'
        client_id = settings.SOCIAL_AUTH_42_KEY
        redirect_uri = 'http://localhost:8000/auth/42/callback'
        response_type = 'code'
        state = 'some_unique_random_string' 
        
        url = f"{authorize_url}?client_id={client_id}&redirect_uri={redirect_uri}&response_type={response_type}&state={state}"
        
        return Response({'url': url})
