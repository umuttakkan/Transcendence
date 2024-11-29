from django.shortcuts import render
from django.views import View
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class JWTAuthRequiredMixin:
    def dispatch(self, request, *args, **kwargs):
        jwt_auth = JWTAuthentication()
        header = request.META.get('HTTP_AUTHORIZATION', '')
        print("calisiyor123")
        # Authorization başlığını kontrol et
        if not header.startswith('Bearer '):
            return JsonResponse({'message': 'Invalid or missing token format'}, status=401)
        print("calisiyor1234")
        token = header.split(' ')[1]
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)

            if not user:
                return JsonResponse({'message': 'User not found'}, status=401)
            request.user = user

        except AuthenticationFailed as auth_error:
            print("Authentication failed:", str(auth_error))
            print("calisiyor12345")
            return JsonResponse({'message': 'Authentication failed'}, status=401)

        except Exception as e:
            print("Unexpected authentication error:", str(e))
            return JsonResponse({'message': 'Authentication error'}, status=401)
        return super().dispatch(request, *args, **kwargs)


class HomePageView(JWTAuthRequiredMixin,View):
    def get(self, request):
        return render(request, 'home.html')

class SPAView(View):
    def get(self, request):
        return render(request, 'index.html')

class LoginPageView(View):
    def get(self, request):
        return render(request, 'login.html')

class RegisterPageView(View):
	def get(self, request):
		return render(request, 'register.html')

class TwoFAView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({'message': 'Authentication failed'})
        return render(request, '2fa.html')

class ProfilePageView(JWTAuthRequiredMixin, View):
    def get(self, request):
        return render(request, 'profile.html')

class GameHomeView(JWTAuthRequiredMixin,View):
    def get(self, request):
        return render(request, 'game_home.html')

class VsModView(JWTAuthRequiredMixin,View):
    def get(self, request):
        return render(request, 'vs_mod.html')

class TournamentView(JWTAuthRequiredMixin,View):
    def get(self, request):
        return render(request, 'tournament.html')

class GameView(JWTAuthRequiredMixin,View):
    def get(self, request):
        return render(request, 'game.html')
    