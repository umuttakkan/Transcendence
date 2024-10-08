from django.db import models
from accounts.models import User

class Match(models.Model):
    user1 = models.ForeignKey(User, related_name='player1_scores', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='player2_scores', on_delete=models.CASCADE)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    # created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"User Score = {self.username}: {self.score}"
    
    def end_game(self):
        self.is_active = False
        self.save()

class GamePlayHistory(models.Model):
    player = models.ForeignKey(Match, related_name='usergameplayhistory', on_delete=models.CASCADE)
    result = models.CharField(max_length=255) #victory/defeat
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player}: {self.result} | {self.score1} / {self.score2}"