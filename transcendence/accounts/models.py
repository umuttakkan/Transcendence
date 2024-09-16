from django.db import models
from django.utils import timezone
from datetime import timedelta
# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class User(models.Model):
    name = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    confirm_password = models.CharField(max_length=100)
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email

# yeni model 2fa

class VerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def get_code(self):
        return self.code
    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at and not self.pk:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)
