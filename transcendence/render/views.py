from django.shortcuts import render
from django.views import View
from django.shortcuts import render, get_object_or_404
from accounts.models import User

class LoginPageView(View):
    def get(self, request):
        return render(request, 'login.html')
    
class RegisterPageView(View):
	def get(self, request):
		return render(request, 'register.html')

class TwoFAView(View):
    def get(self, request):
        return render(request, '2fa.html')

class HomePageView(View):
    def get(self, request):
        user = request.user
        print(f"User: {request.user}, Authenticated: {request.user.is_authenticated}")
        return render(request, 'home.html', {'user': user})

class ProfilePageView(View):
    def get(self, request, *args, **kwargs):
            pk = kwargs.get('pk')
            user = get_object_or_404(User, pk=pk)
            context = {
                'name': user.name, 
                'lastname': user.lastname,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
            }
            return render(request, 'profile.html', context)
