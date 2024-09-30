from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from Pong.models import Match
from django.views.generic import TemplateView
# from django.contrib.auth.decorators import login_required

# @login_required
# class VsMode(TemplateView):
#     template_name = 'vs_mode.html'

class Pongi(TemplateView):
    template_name = 'vs.html'

class Pong(TemplateView):
    template_name = 'tournament.html'

class vspong(TemplateView):
    template_name = 'play.html'

class MatchmakingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        # Zaten bekleyen bir oyun var mı kontrol et
        pending_game = Match.objects.filter(is_active=True, player2__isnull=True).first()
        
        if pending_game:
            pending_game.player2 = user
            pending_game.save()
            return Response({'message': 'Maç başladı!'}, status=status.HTTP_200_OK)
        else:
            # Yeni oyun oluştur
            new_game = Match.objects.create(player1=user)
            return Response({'message': 'Rakip bekleniyor...'}, status=status.HTTP_200_OK)
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
            return Response({'error': 'Oyuncu bu oyunda yer almıyor.'}, status=status.HTTP_400_BAD_REQUEST)

        game.save()
        return Response({'message': 'Skor güncellendi!'}, status=status.HTTP_200_OK)

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
        
        # Kazananı belirle
        if game.player1_score > game.player2_score:
            winner = game.player1
        elif game.player1_score < game.player2_score:
            winner = game.player2
        else:
            winner = None  # Beraberlik durumu

        # Sonucu işleyin
        if winner:
            return Response({'message': f'{winner.username} kazandı!'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Oyun berabere!'}, status=status.HTTP_200_OK)
