from django.db import models
from accounts.models import User

class Match(models.Model):
    user1 = models.ForeignKey(User, related_name='player1_scores', on_delete=models.CASCADE)
    user2 = models.CharField(max_length=255) #guest player name
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    match_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    winner_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"User Score = {self.username}: {self.score}"
    
    def end_game(self):
        self.is_active = False
        self.save()

class GamePlayHistory(models.Model):
    match = models.ForeignKey(Match, related_name='usergameplayhistory', on_delete=models.CASCADE)
    result = models.CharField(max_length=255)  # Victory/Defeat
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)  # game date

    def __str__(self):
        return f"{self.match}: {self.result} | {self.score1} / {self.score2}"
