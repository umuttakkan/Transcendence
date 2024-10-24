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


# class UpdateScoreAPIView(APIView):
# 	# permission_classes = [IsAuthenticated]

# 	def post(self, request, game_id):
# 		game = get_object_or_404(Match, id=game_id, is_active=True)
# 		if game.player1 == request.user:
# 			game.player1_score += 1
# 		elif game.player2 == request.user:
# 			game.player2_score += 1
# 		else:
# 			return Response({'Error': 'The player isnt in this game!'}, status=status.HTTP_400_BAD_REQUEST)

# 		game.save()
# 		return Response({'Message': 'Score Updated!'}, status=status.HTTP_200_OK)
	
# class EndGameAPIView(APIView):
# 	# permission_classes = [IsAuthenticated]

# 	def post(self, request, game_id):
# 		game = get_object_or_404(Match, id=game_id, is_active=True)
# 		game.end_game()

# 		if game.player1_score > game.player2_score:
# 			winner = game.player1
# 		elif game.player1_score < game.player2_score:
# 			winner = game.player2
# 		else:
# 			winner = None # in a draw

# 		if winner:
# 			return Response({'Message': f'{winner.username} Wins!'}, status=status.HTTP_200_OK)
# 		else:
# 			return Response({'Message': 'The Game Is In A Draw!'}, status=status.HTTP_200_OK)

class MatchmakingAPIView(APIView):
    # permission_classes = [IsAuthenticated]
    @method_decorator(csrf_exempt)
    def post(self, request):
        if request.method == 'POST':
            data = json.loads(request.body)
            score1 = data.get('score1')
            score2 = data.get('score2')
            print(data)
            user1 = User.objects.get(username=data.get('usr1')) # request.user
            user2 = User.objects.get(username=data.get('usr2'))
            match = Match.objects.create(user1=user1, user2=user2, score1=score1, score2=score2)
            return JsonResponse({'status': 'Match result saved successfully', 'match_id': match.id}, status=200)
        return JsonResponse({'error': 'Invalid request method'}, status=400)

class MatchResults(APIView):
	# permission_classes = [IsAuthenticated]
	@method_decorator(csrf_exempt)
	def get(self, request, username):
		if request.method == 'GET':
			print(request.data)
			# usernm = request.data.get('username')
			usr = User.objects.get(username=username) # request.user
			match = Match.objects.filter(user1=usr).order_by('-match_date')
			li = [{'user1': i.user1.username, 'user2': i.user2, 'score1': i.score1, 'score2': i.score2, 'winner_name': i.winner_name} for i in match]
			# match_list = list(match.values('user1', 'user2', 'score1', 'score2', 'winner_name'))
			return JsonResponse({"data": li}, status=200)
		return JsonResponse({'error': 'Invalid request method'}, status=400)
	
	# TODO: create a new api endpoint for saving match results
