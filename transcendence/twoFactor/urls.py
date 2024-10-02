from twoFactor import views as api_views
from django.urls import path 

urlpatterns = [
    path('sendMail/', api_views.SendMailAPIView.as_view(), name='sendMail'),
]
