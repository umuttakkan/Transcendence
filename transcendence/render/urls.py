from render.views import LoginPageView, RegisterPageView, TwoFAView, HomePageView , ProfilePageView
from django.urls import path 

urlpatterns = [
    path('Login/', LoginPageView.as_view(), name='Login'),
    path('Register/', RegisterPageView.as_view(), name='Register'),
    path('2fa/', TwoFAView.as_view(), name='2fa'),
    path('home/', HomePageView.as_view(), name='Home'),
    path('me/', ProfilePageView.as_view(), name='Profile'),
]
