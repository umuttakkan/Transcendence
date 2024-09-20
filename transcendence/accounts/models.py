from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

class BaseUserManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError('Invalid email address')
            
    def create_user(self, email, name, lastname, username, password, **extra_fields):
        if email:
            email = self.normalize_email(email)
            self.email_validator(email)
        else:
            raise ValueError('Email is required')
        if not name:
            raise ValueError('Name is required')
        if not lastname:
            raise ValueError('Lastname is required')
        if not username:
            raise ValueError('Username is required')

        user = self.model(username=username, email=email, name=name, lastname=lastname)
        user.set_password(password)
        user.save()
        print("bakalim sifreye ne oluyor")
        print(user.check_password(password))
        print(user.password)
        return user

class User(AbstractBaseUser):
    name = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    # USERNAME_FIELD = 'username'
    USERNAME_FIELD = 'email'
    
    objects = BaseUserManager()
    
    def clean(self):
        if len(self.phone) < 10:
            raise ValidationError('Phone number must be at least 10 characters long')
        if not self.email.endswith('@example.com'):
            raise ValidationError('Email must end with @example.com')
        
    def __str__(self):
        return self.email

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
