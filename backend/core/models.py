
from django.db import models
import uuid
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager



# Custom user manager
class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    auth_provider = models.CharField(max_length=10, choices=(('email', 'Email'), ('google', 'Google')), default='email')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# -----------------------------
# USER STATS
# -----------------------------

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    available_credits = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)  # INR, default 5
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Stats for {self.user.email}"


# -----------------------------
# CHAT SESSION
# -----------------------------
class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    session_name = models.CharField(max_length=255, blank=True, null=True)
    model_selection = models.JSONField()  # {"openai": ["GPT-4o"], "azure": ["gpt-35-turbo"]}
    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} for {self.user.email}"


# -----------------------------
# PROMPT MESSAGE
# -----------------------------

class PromptMessage(models.Model):
    SENDER_TYPES = (
        ('user', 'User'),
        ('system', 'System'),
    )

    chat_session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_TYPES, default='user')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sender} message in session {self.chat_session.id}"


# -----------------------------
# MODEL RESPONSE
# -----------------------------

class ModelResponse(models.Model):
    PROVIDERS = (
        ('openai', 'OpenAI'),
        ('azure', 'Azure'),
        ('deepseek', 'DeepSeek'),
    )

    prompt_message = models.ForeignKey(PromptMessage, on_delete=models.CASCADE, related_name='model_responses')
    model_label = models.CharField(max_length=100)  # e.g., 'GPT-4o'
    provider = models.CharField(max_length=20, choices=PROVIDERS)
    response_content = models.TextField()
    latency_ms = models.IntegerField(null=True, blank=True)
    token_count = models.IntegerField(null=True, blank=True)
    cost_inr = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.model_label} response for message {self.prompt_message.id}"


# -----------------------------
# TRANSACTION HISTORY
# -----------------------------

class TransactionHistory(models.Model):
    TRANSACTION_TYPES = (
        ('topup', 'Top-up'),
        ('deduct', 'Deduct'),
        ('refund', 'Refund'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount_inr = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    metadata = models.JSONField(null=True, blank=True)  # e.g., Razorpay reference
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.transaction_type} ₹{self.amount_inr} for {self.user.email}"
