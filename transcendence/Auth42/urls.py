from django.urls import path
from .views import Callback42View

urlpatterns = [
    # path('login/', Login42APIView.as_view(), name='login_42'),
    path('callback/', Callback42View.as_view(), name='callback_42'),
]
