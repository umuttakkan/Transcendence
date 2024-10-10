from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Pong.models import Match
from django.views.generic import TemplateView
# from django.contrib.auth.decorators import login_required

# @login_required

class Pongi(TemplateView):
	template_name = 'vs.html'

class Pong(TemplateView):
	template_name = 'tournament.html'

class vspong(TemplateView):
	template_name = 'game.html'

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

# def update_score(request):
#     if request.method == 'POST':
#         user = request.user
#         score = int(request.POST.get('score'))
#         player_score, created = PlayerScore.objects.get_or_create(user=user)
#         player_score.score = score
#         player_score.save()
#         return JsonResponse({'username': user.username, 'score': player_score.score})
	
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
