from render.views import LoginPageView, RegisterPageView, TwoFAView, HomePageView , ProfilePageView, ft_twoFAView, GameHomeView
from django.urls import path, re_path
from render.views import SPAView

urlpatterns = [
    path('', SPAView.as_view(), name='spa'),
    path('login/', SPAView.as_view(), name='loginSpa'),
    path('register/', SPAView.as_view(), name='registerSpa'),
    path('2fa/', SPAView.as_view(), name='2faSpa'),
    path('home/', SPAView.as_view(), name='homeSpa'),
    path('me/', SPAView.as_view(), name='profileSpa'),
    path('ft_login/', SPAView.as_view(), name='login42Spa'),
    path('mail/', SPAView.as_view(), name='mailSpa'),
    # path('42-login/', LoginPageView.as_view(), name='login42'),
    path('login/get-html/', LoginPageView.as_view(), name='login'),
    path('register/get-html/', RegisterPageView.as_view(), name='register'),
    path('2fa/get-html/', TwoFAView.as_view(), name='2fa'),
    path('home/get-html/', HomePageView.as_view(), name='home'),
    path('me/get-html/', ProfilePageView.as_view(), name='profile'),
    path('mail/get-html/', ft_twoFAView.as_view(), name='mail'),
    path('game/get-html/', GameHomeView.as_view(), name='game_home'),
]
