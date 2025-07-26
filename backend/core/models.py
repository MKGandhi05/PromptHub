from django.db import models
from django.utils import timezone


# -----------------------------
# CUSTOM USER MODEL
# -----------------------------

class User(models.Model):
    AUTH_PROVIDERS = (
        ('email', 'Email'),
        ('google', 'Google'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=256)  # You'll manage hashing
    auth_provider = models.CharField(max_length=10, choices=AUTH_PROVIDERS, default='email')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.email


# -----------------------------
# USER STATS
# -----------------------------

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    remaining_free_trials = models.IntegerField(default=3)
    available_credits = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # INR
    last_used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Stats for {self.user.email}"


# -----------------------------
# CHAT SESSION
# -----------------------------

class ChatSession(models.Model):
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
