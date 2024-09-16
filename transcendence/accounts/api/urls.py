from accounts.api import views as api_views
from django.urls import path 

urlpatterns = [
    path('login/', api_views.LoginAPIView.as_view(), name='login'),
    path('register/', api_views.RegistrationAPIView.as_view(), name='register'),
    path('verify/', api_views.VerifyAPIView.as_view(), name='verify'),
    path('users/<int:pk>/', api_views.ProfileAPIView.as_view(), name='user-detail'),
]
