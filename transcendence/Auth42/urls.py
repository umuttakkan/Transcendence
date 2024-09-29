from django.urls import path
from .views import Callback42View, Login42View

urlpatterns = [
    path('ft_login/', Login42View.as_view(), name='login_42'),
    path('callback/', Callback42View.as_view(), name='callback_42'),
]
