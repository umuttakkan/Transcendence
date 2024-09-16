from django.urls import path
from .views import Login42APIView, OAuthCompleteView

urlpatterns = [
    path('login/', Login42APIView.as_view(), name='login_42'),
]
