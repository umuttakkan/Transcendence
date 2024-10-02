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

class SPAView(View):
    def get(self, request):
        return render(request, 'index.html')

class LoginPageView(View):
    def get(self, request):
        return render(request, 'login.html' )

class RegisterPageView(View):
	def get(self, request):
		return render(request, 'register.html')

class TwoFAView(View):
    def get(self, request):
        return render(request, '2fa.html')

class HomePageView(View):
    def get(self, request):
        return render(request, 'home.html')

class ProfilePageView(View):
    def get(self, request):
        return render(request, 'profile.html')

class ft_twoFAView(View):
    def get(self, request):
        return render(request, 'mail.html')

class PongPageView(View):
    def get(self, request):
        return render(request, 'Pong.html')

class GameHomeView(View):
    def get(self, request):
        return render(request, 'game_home.html')