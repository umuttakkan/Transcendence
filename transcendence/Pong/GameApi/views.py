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
from Pong.models import User
# @login_required

class MatchmakingAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		# checking if there is a pending game
		pending_game = Match.objects.filter(is_active=True, player2__isnull=True).first()

		if pending_game:
			pending_game.player2 = user
			pending_game.save()
			return Response({'message': 'Game Started!'}, status=status.HTTP_200_OK)
		else:
			new_game = Match.objects.create(player1=user)
			return Response({'message': 'Waiting opponent...'}, status=status.HTTP_200_OK)
			# return render(request, 'pong.html')

class UpdateScoreAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, game_id):
		game = get_object_or_404(Match, id=game_id, is_active=True)
		if game.player1 == request.user:
			game.player1_score += 1
		elif game.player2 == request.user:
			game.player2_score += 1
		else:
			return Response({'Error': 'The player isnt in this game!'}, status=status.HTTP_400_BAD_REQUEST)

		game.save()
		return Response({'Message': 'Score Updated!'}, status=status.HTTP_200_OK)
	
class EndGameAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, game_id):
		game = get_object_or_404(Match, id=game_id, is_active=True)
		game.end_game()

		if game.player1_score > game.player2_score:
			winner = game.player1
		elif game.player1_score < game.player2_score:
			winner = game.player2
		else:
			winner = None # in a draw

		if winner:
			return Response({'Message': f'{winner.username} Wins!'}, status=status.HTTP_200_OK)
		else:
			return Response({'Message': 'The Game Is In A Draw!'}, status=status.HTTP_200_OK)

class MatchResults(APIView):
	@method_decorator(csrf_exempt)
	def get(self, request):
		if request.method == 'GET':
			match_id = request.GET.get('match_id')
			match = Match.objects.get(id=match_id)
			return JsonResponse({'match_id': match.id, 'score1': match.score1, 'score2': match.score2}, status=200)
		return JsonResponse({'error': 'Invalid request method'}, status=400)

	@method_decorator(csrf_exempt)
	def post(self, request):
		if request.method == 'POST':
			data = json.loads(request.body)
			score1 = data.get('score1')
			score2 = data.get('score2')
			user1 = User.objects.get(username="Anakin") # request.user
			user2 = User.objects.get(username="Anakin")

			# Match modeline sonucu kaydet
			match = Match.objects.create(user1=user1, user2=user2, score1=score1, score2=score2)

			return JsonResponse({'status': 'Match result saved successfully', 'match_id': match.id}, status=200)

		return JsonResponse({'error': 'Invalid request method'}, status=400)
