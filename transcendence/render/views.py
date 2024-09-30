from django.shortcuts import render
from django.views import View
from django.shortcuts import render, get_object_or_404
from accounts.models import User
import secrets
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
import json
from rest_framework_simplejwt.tokens import RefreshToken
from templates import *
from static import *

class SPAView(View):
    def get(self, request):
        return render(request, 'index.html')

class LoginPageView(View):
    def get(self, request):
        # state = secrets.token_urlsafe(16)
        # url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.SOCIAL_AUTH_42_KEY}&redirect_uri=http://localhost:8000/auth/callback&response_type=code"
        # response.set_cookie('state', state, httponly=True, samesite='Lax')
        return render(request, 'login.html' )# ,{'url': url})

class RegisterPageView(View):
	def get(self, request):
		return render(request, 'register.html')

class TwoFAView(LoginRequiredMixin,View):
    def get(self, request):
        return render(request, '2fa.html')

class HomePageView(View):
    # login_url = '/login/'
    def get(self, request):
        user = request.user
        # print(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return render(request, 'home.html', {'user': user})

class ProfilePageView(LoginRequiredMixin,View):
    def get(self, request):
        return render(request, 'profile.html')

class PongPageView(View):
    def get(self, request):
        return render(request, 'Pong.html')

class GameHomeView(View):
    def get(self, request):
        return render(request, 'game_home.html')