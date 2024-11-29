from django.db import models
from accounts.models import User
import uuid

class Match(models.Model):
    winnerName = models.CharField(max_length=100)
    loserName = models.CharField(max_length=100)
    winnerScore = models.IntegerField(default=0)
    loserScore = models.IntegerField(default=0)
    match_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"User Score = {self.username}: {self.score}"
    
    def end_game(self):
        self.is_active = False
        self.save()
    def get_result_for_user(self, username):
        if username == self.winnerName:
            return "+20"
        elif username == self.loserName:
            return "-20"

class GamePlayHistory(models.Model):
    match = models.ForeignKey(Match, related_name='usergameplayhistory', on_delete=models.CASCADE)
    result = models.CharField(max_length=255) 
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"{self.match}: {self.result} | {self.score1} / {self.score2}"

