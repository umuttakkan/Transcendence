from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import validate_email, MinLengthValidator
from django.core.validators import RegexValidator

class CustomUserManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError('Invalid email address')
    def create_user(self, email, name, lastname, username, password, phone,**extra_fields):
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
        if not phone:
            raise ValueError('Phone is required')

        user = self.model(username=username, email=email, name=name, lastname=lastname, phone=phone)

        user.set_password(password)
        user.save()
        print("bakalim sifreye ne oluyor")
        print(user.check_password(password))
        print(user.password)
        return user

class User(AbstractBaseUser):
    name = models.CharField(validators=[MinLengthValidator(2)],max_length=100, error_messages={'min_length': 'Name must be at least 2 characters long'})
    lastname = models.CharField(validators=[MinLengthValidator(2)],max_length=100, error_messages={'min_length': 'Lastname must be at least 2 characters long'})
    username = models.CharField(validators=[MinLengthValidator(2)],max_length=100, unique=True, error_messages={'min_length': 'Username must be at least 2 characters long'})
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(auto_now=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message="Phone number must be exactly 10 digits."
            )
        ],
    )    
    rank = models.IntegerField(default=420)
    two_factor_enabled = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    
    objects = CustomUserManager()

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

    def mark_as_used(self):
        self.used = True
        self.save()

    def save(self, *args, **kwargs):
        if not self.expires_at and not self.pk:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)