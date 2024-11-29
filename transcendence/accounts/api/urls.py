from accounts.api import views as api_views
from django.urls import path

urlpatterns = [
    path('login/', api_views.LoginAPIView.as_view(), name='login'),
    path('register/', api_views.RegistrationAPIView.as_view(), name='register'),
    path('verify/', api_views.VerifyAPIView.as_view(), name='verify'),
    path('users/', api_views.ProfileAPIView.as_view(), name='user-detail'),
    path('logout/', api_views.LogoutAPIView.as_view(), name='logout'),
    path('reset_code/', api_views.ResetCodeAPIView.as_view(), name='reset_code'),
    path('twoFactor_update/', api_views.TwoFactorUpdateAPIView.as_view(), name='twoFactor_update'),
    path('delete/', api_views.DeleteAPIView.as_view(), name='delete'),
]
