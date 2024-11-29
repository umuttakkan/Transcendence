from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Pong.models import Match
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from rest_framework import generics
from accounts.models import User
from accounts.models import VerificationCode
from django.core.mail import send_mail
from django.conf import settings
import random
import jwt

def login_send_mail(email):
    verification_code = random.randint(100000, 999999)
    print(email)
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

class MatchmakingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = json.loads(request.body)
        winnerScore = data.get('winnerScore')
        loserScore = data.get('loserScore')
        winnerName = data.get('winnerName')
        loserName = data.get('loserName')
        
        if winnerName == "AI":
            loserPlayer = User.objects.filter(username=loserName).first()
            loserPlayer.rank -= 20
            loserPlayer.save()
            Match.objects.create(winnerName="AI", loserName=loserName, winnerScore=winnerScore, loserScore=loserScore)
        elif loserName == "AI":
            winnerPlayer = User.objects.filter(username=winnerName).first()
            winnerPlayer.rank += 20
            winnerPlayer.save()
            Match.objects.create(winnerName=winnerName, loserName="AI", winnerScore=winnerScore, loserScore=loserScore)
        else:
            winnerPlayer = User.objects.filter(username=winnerName).first()
            winnerPlayer.rank += 20
            loserPlayer = User.objects.filter(username=loserName).first()
            loserPlayer.rank -= 20
            winnerPlayer.save()
            loserPlayer.save()
            Match.objects.create(winnerName=winnerName, loserName=loserName, winnerScore=winnerScore, loserScore=loserScore)
        return Response({'success':"success"}, status=200)

class UsernameAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        username = request.data.get('username')
        user = User.objects.filter(username=username).first()
        if user is None:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        verify_code = login_send_mail(user.email)
        if verify_code == 0:
            return Response({'error': 'Error sending email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        VerificationCode.objects.create(user=user, code=verify_code)    
        return Response({'Message': 'User found'}, status=status.HTTP_200_OK)

class TournamentVerifyAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        username = request.data.get('username')
        verify_code = request.data.get('code')
        user = User.objects.filter(username=username).first()
        verify = VerificationCode.objects.filter(user=user, code=verify_code).first()
        if verify is None:
            return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        if verify.is_valid():
                verify.used = True
                verify.save()
        return Response({'success': 'User verified'}, status=status.HTTP_200_OK)



class MatchResults(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        access_token = request.headers.get('Authorization').split(' ')[1]
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
        
        user = User.objects.filter(id=payload['user_id']).first()
        user_name = user.username

        matches = Match.objects.filter(
            winnerName=user_name
        ).union(
            Match.objects.filter(loserName=user_name)
        ).order_by('-match_date')

        match_data = []
        for match in matches:
            temp = match.get_result_for_user(user_name) 
            match_data.append({
                'user1': match.winnerName,
                'user2': match.loserName,
                'score1': match.winnerScore,
                'score2': match.loserScore,
                'winner_name': match.winnerName,
                'match_date': match.match_date,
                'rank_change': temp,
                'rank': user.rank
            })

        return Response({"data": match_data}, status=200)