from typing import Any
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.http import JsonResponse
from .models import Match
from .models import GamePlayHistory

class GameHomeView(LoginRequiredMixin, TemplateView):
	template_name = 'game_home.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		user = self.request.user
		# Kullanıcının player olarak yer aldığı oyunları bul
		players = Match.objects.filter(user1=user) | Match.objects.filter(user2=user)
		# Kullanıcının geçmişini tutacak bir liste
		user_game_history = []

		for player_instance in players:
			# Eğer kullanıcı user1 ise
			if player_instance.user1 == user:
				# Kullanıcının skoru ve sonuçlarını al
				user_game_history.append({
					'score': player_instance.score1,
					'result': 'Victory' if player_instance.score1 > player_instance.score2 else 'Defeat'
				})
			# Eğer kullanıcı user2 ise
			elif player_instance.user2 == user:
				# Kullanıcının skoru ve sonuçlarını al
				user_game_history.append({
					'score': player_instance.score2,
					'result': 'Victory' if player_instance.score2 > player_instance.score1 else 'Defeat'
				})

		context['game_history'] = user_game_history
		return context

# # pong/views.py
# @login_required
# def leaderboard(request):
#     scores = PlayerScore.objects.all().order_by('-score')
#     return render(request, 'pong/leaderboard.html', {'scores': scores})