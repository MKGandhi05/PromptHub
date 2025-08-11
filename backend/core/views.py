from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .semantic_kernel_utils import get_openai_response_with_sk, get_azure_response_with_sk
import os
from django.conf import settings
from dotenv import load_dotenv
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserStats
from rest_framework.permissions import IsAuthenticated

load_dotenv(os.path.join(settings.BASE_DIR, '.env'))


class PromptListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # In stateless mode, GET can return an empty list or a placeholder
        return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        try:
            user_stats = user.stats
        except Exception:
            return Response({'error': 'User stats not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # Count how many comparisons (models) are being requested
        selected_models = request.data.get("models", [
            {"provider": "openai", "label": "GPT-4o"},
            {"provider": "openai", "label": "o4 – mini"},
            {"provider": "openai", "label": "GPT-4.1 -mini"},
            {"provider": "azure", "label": "GPT-4o"},
            {"provider": "azure", "label": "o4 – mini"},
            {"provider": "azure", "label": "gpt-35-turbo"},
        ])
        num_comparisons = len(selected_models)

        # Check if user has enough free trials or credits
        free_trials_to_use = min(user_stats.remaining_free_trials, num_comparisons)
        credits_needed = num_comparisons - free_trials_to_use
        if user_stats.remaining_free_trials == 0 and user_stats.available_credits < credits_needed:
            return Response({'error': 'No free trials or enough credits left.'}, status=status.HTTP_402_PAYMENT_REQUIRED)
        if user_stats.remaining_free_trials > 0 and (user_stats.remaining_free_trials + user_stats.available_credits) < num_comparisons:
            return Response({'error': 'Not enough free trials or credits for all comparisons.'}, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Deduct free trials and credits
        user_stats.remaining_free_trials -= free_trials_to_use
        user_stats.available_credits -= credits_needed
        user_stats.save()

        prompt_text = request.data.get("text")
        if not prompt_text:
            return Response({"error": "Prompt text is required."}, status=status.HTTP_400_BAD_REQUEST)

        model_map = {
            "openai": {
                "GPT-4o": "gpt-4o",
                "o4 – mini": "o4-mini",
                "GPT-4.1 -mini": "gpt-4.1-mini"
            },
            "azure": {
                "GPT-4o": {
                    "deployment": "gpt-4o",
                    "api_version": "2024-12-01-preview"
                },
                "o4 – mini": {
                    "deployment": "o4-mini",
                    "api_version": "2024-12-01-preview"
                },
                "GPT-35-turbo": {
                    "deployment": "gpt-35-turbo",
                    "api_version": "2024-12-01-preview"
                }
            }
        }

        responses = {}
        for model in selected_models:
            provider = model.get("provider", "openai")
            label = model.get("label")
            try:
                if provider == "openai":
                    model_id = model_map.get(provider, {}).get(label)
                    if model_id:
                        responses[f"openai-{label}"] = get_openai_response_with_sk(prompt_text, model_id)
                elif provider == "azure":
                    model_config = model_map.get(provider, {}).get(label)
                    if model_config:
                        responses[f"azure-{label}"] = get_azure_response_with_sk(
                            prompt_text,
                            model_config["deployment"],
                            model_config["api_version"]
                        )
            except Exception as e:
                responses[f"{provider}-{label}"] = f"Error: {str(e)}"

        return Response({
            'prompt': {"text": prompt_text},
            'responses': responses,
            'remaining_free_trials': user_stats.remaining_free_trials,
            'available_credits': float(user_stats.available_credits),
        }, status=status.HTTP_201_CREATED)


class PromptResponseListView(APIView):
    def get(self, request, prompt_id):
        # Since stateless, we return empty or dummy responses
        return Response([], status=status.HTTP_200_OK)

# ----------------- REGISTER -----------------
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User(email=email, username=username)
        user.set_password(password)
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "User registered successfully",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {"email": user.email, "username": user.username}
        }, status=status.HTTP_201_CREATED)

# ----------------- LOGIN -----------------
class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {"email": user.email, "username": user.username}
        }, status=status.HTTP_200_OK)

# ----------------- USER STATS -----------------
class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            stats = user.stats
            return Response({
                'remaining_free_trials': stats.remaining_free_trials,
                'available_credits': float(stats.available_credits),
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'User stats not found.'}, status=status.HTTP_404_NOT_FOUND)