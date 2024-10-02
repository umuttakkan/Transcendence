from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
import random
from rest_framework.views import APIView
from rest_framework import status
from accounts.models import VerificationCode, User
# Create your views here.
import jwt

def login_send_mail(email):
    verification_code = random.randint(100000, 999999)
    try:
        send_mail(
            'Login Verification Code',
            f'Your verification code is {verification_code}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return verification_code
    except Exception as e:
        print(f'Error: {e}')
        return 0

class SendMailAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        login = request.data.get('login')
        verification_code = login_send_mail(email)
        if login == "ft_login":
            access_token = request.data.get('access_token')
            payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.filter(id=payload['user_id']).first()
            verify = VerificationCode.objects.create(user=user, code=verification_code)
            verify.save()
        if verification_code:
            return Response({'verification_code': verification_code, 'message': 'Verification code sent'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Error sending email'}, status=status.HTTP_400_BAD_REQUEST)