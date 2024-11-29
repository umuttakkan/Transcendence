from django.urls import path
from .views import MatchmakingAPIView,UsernameAPIView, TournamentVerifyAPIView, MatchResults

urlpatterns = [
    path('match_results_post/', MatchmakingAPIView.as_view(), name='matchmaking'),
    path('match_results/', MatchResults.as_view(), name='match_results'),
    path('user/', UsernameAPIView.as_view(), name='user'),
    path('tournament_verify/', TournamentVerifyAPIView.as_view(), name='tournament_verify'),
]