from django.urls import path
from rest_framework import routers
from .views import MatchmakingAPIView, MatchResults

urlpatterns = [
    path('match_results_post/', MatchmakingAPIView.as_view(), name='matchmaking'),
    # path('update_score/<int:game_id>/', UpdateScoreAPIView.as_view(), name='update_score'),
    # path('end_game/<int:game_id>/', EndGameAPIView.as_view(), name='end_game'),
    path('match_results/<str:username>', MatchResults.as_view(), name='match_results'),

]