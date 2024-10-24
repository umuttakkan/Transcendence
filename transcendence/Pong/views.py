from typing import Any
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.http import JsonResponse
from .models import Match
from .models import GamePlayHistory

class Pongi(TemplateView):
	template_name = 'vs.html'

class Pong(TemplateView):
	template_name = 'tournament.html'

class vspong(TemplateView):
	template_name = 'game.html'

class GameHomeView(LoginRequiredMixin, TemplateView):
	template_name = 'game_home.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		user = self.request.user
		games = Match.objects.filter(user1=user).order_by('-match_date') # Finding that user is a player1 or player2 in the match

		user_game_history = []

		for game in games:
			user_game_history.append({
				"date"	: game.match_date,
				"user1:": game.user1.username,
				"user2:": game.user2,
				'score1': game.score1,
				'score2': game.score2,
				'result': 'Victory' if game.score1 > game.score2 else 'Draw' if game.score1 == game.score2 else 'Defeat',
			})
		print(user_game_history)
		context['game_history'] = user_game_history
		return context

# # pong/views.py
# @login_required
# def leaderboard(request):
#     scores = PlayerScore.objects.all().order_by('-score')
#     return render(request, 'pong/leaderboard.html', {'scores': scores})