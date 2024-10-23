from django.urls import path, include
from rest_framework import routers
from .views import GameHomeView, Pongi, Pong, vspong
from .GameApi import urls

urlpatterns = [
    path('', GameHomeView.as_view(), name='game_home'),
    path('vs_mode/', Pongi.as_view(), name='vs_mode'),
    path('tour_mode/', Pong.as_view(), name='tournament_mode'),
    path('vspong/', vspong.as_view(), name='vspong'),
    path('', include('Pong.GameApi.urls')),
]