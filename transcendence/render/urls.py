from render.views import LoginPageView, RegisterPageView, TwoFAView, HomePageView , ProfilePageView, GameHomeView, VsModView, TournamentView, GameView
from django.urls import path
from render.views import SPAView

urlpatterns = [
    path('', SPAView.as_view(), name='spa'),
    path('login/', SPAView.as_view(), name='loginSpa'),
    path('register/', SPAView.as_view(), name='registerSpa'),
    path('2fa/', SPAView.as_view(), name='2faSpa'),
    path('home/', SPAView.as_view(), name='homeSpa'),
    path('me/', SPAView.as_view(), name='profileSpa'),
    path('ft_login/', SPAView.as_view(), name='login42Spa'),
    path('game/', SPAView.as_view(), name='game'),
    path('game_home/', SPAView.as_view(), name='game_home'),
    path('vs_mod/', SPAView.as_view(), name='vs_mod'),
    path('tournament/', SPAView.as_view(), name='tournament'),

    path('login/get-html/', LoginPageView.as_view(), name='login'),
    path('register/get-html/', RegisterPageView.as_view(), name='register'),
    path('2fa/get-html/', TwoFAView.as_view(), name='2fa'),
    path('home/get-html/', HomePageView.as_view(), name='home'),
    path('me/get-html/', ProfilePageView.as_view(), name='profile'),
    path('game/get-html/', GameView.as_view(), name='game'),
    path('game_home/get-html/', GameHomeView.as_view(), name='game_home'),
    path('vs_mod/get-html/', VsModView.as_view(), name='vs_mod'),
    path('tournament/get-html/', TournamentView.as_view(), name='tournament'),
]
