from rest_framework import serializers
from .models import Prompt, PromptResponse

class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ['id', 'text', 'created_at']

class PromptResponseSerializer(serializers.ModelSerializer):
    prompt = PromptSerializer(read_only=True)
    class Meta:
        model = PromptResponse
        fields = ['id', 'prompt', 'response_text', 'created_at']
