from django.urls import path
# from . import views
from .views import *
from .GameApi.views import *
from rest_framework import routers
from templates import *
from static import *

urlpatterns = [
    path('', GameHomeView.as_view(), name='game_home'),
    path('vs_mode/', Pongi.as_view(), name='vs_mode'),
    path('tour_mode/', Pong.as_view(), name='tournament_mode'),
    path('vspong/', vspong.as_view(), name='vspong'),
]
