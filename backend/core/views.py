from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .semantic_kernel_utils import get_openai_response_with_sk, get_azure_response_with_sk
import os
from django.conf import settings
from dotenv import load_dotenv
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserStats, ChatSession, PromptMessage, ModelResponse
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal


load_dotenv(os.path.join(settings.BASE_DIR, '.env'))

class ComparisonHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = ChatSession.objects.filter(user=user).order_by('-started_at')[:20]
        history = []
        for session in sessions:
            for msg in session.messages.all():
                responses = ModelResponse.objects.filter(prompt_message=msg)
                history.append({
                    "prompt": msg.content,
                    "created_at": msg.created_at,
                    "models": [
                        {
                            "model_label": r.model_label,
                            "provider": r.provider,
                            "response": r.response_content,
                            "created_at": r.created_at
                        }
                        for r in responses
                    ]
                })
        return Response(history, status=200)
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

        # Multi-turn: get session_id if provided
        session_id = request.data.get("session_id")
        selected_models = request.data.get("models", [])
        prompt_text = request.data.get("text")
        if not prompt_text:
            return Response({"error": "Prompt text is required."}, status=status.HTTP_400_BAD_REQUEST)

        # If session_id provided, fetch session, else create new
        if session_id:
            try:
                chat_session = ChatSession.objects.get(id=session_id, user=user)
            except ChatSession.DoesNotExist:
                return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
            # Use previous model selection
            if not selected_models:
                selected_models = chat_session.model_selection
        else:
            if not selected_models:
                return Response({"error": "Model selection required for new session."}, status=status.HTTP_400_BAD_REQUEST)
            chat_session = ChatSession.objects.create(
                user=user,
                session_name=None,
                model_selection=selected_models
            )

        # Calculate credits
        total_credits_needed = Decimal("0")
        for model in selected_models:
            try:
                price = Decimal(str(model.get('price', 1)))
            except (TypeError, ValueError):
                price = Decimal("1")
            total_credits_needed += price
        if user_stats.available_credits < total_credits_needed:
            return Response({'error': 'Not enough credits left.'}, status=status.HTTP_402_PAYMENT_REQUIRED)
        user_stats.available_credits -= total_credits_needed
        user_stats.save()

        # Save PromptMessage
        prompt_message = PromptMessage.objects.create(
            chat_session=chat_session,
            sender='user',
            content=prompt_text
        )

        # Build chat history for each model
        # For each model, collect all previous user/model messages in order
        all_messages = PromptMessage.objects.filter(chat_session=chat_session).order_by('created_at')
        responses = {}
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
        from semantic_kernel.contents.chat_history import ChatHistory
        for model in selected_models:
            provider = model.get("provider", "openai")
            label = model.get("label")
            try:
                # Build chat history for this model using ChatHistory object
                chat_history = ChatHistory()
                for msg in all_messages:
                    chat_history.add_user_message(msg.content)
                    model_responses = msg.model_responses.filter(model_label=label, provider=provider)
                    for r in model_responses:
                        chat_history.add_assistant_message(r.response_content)

                # Call model with full chat history
                if provider == "openai":
                    model_id = model_map.get(provider, {}).get(label)
                    if model_id:
                        resp = get_openai_response_with_sk(chat_history, model_id)
                        responses[f"openai-{label}"] = resp
                        ModelResponse.objects.create(
                            prompt_message=prompt_message,
                            model_label=label,
                            provider=provider,
                            response_content=resp
                        )
                elif provider == "azure":
                    model_config = model_map.get(provider, {}).get(label)
                    if model_config:
                        resp = get_azure_response_with_sk(
                            chat_history,
                            model_config["deployment"],
                            model_config["api_version"]
                        )
                        responses[f"azure-{label}"] = resp
                        ModelResponse.objects.create(
                            prompt_message=prompt_message,
                            model_label=label,
                            provider=provider,
                            response_content=resp
                        )
            except Exception as e:
                responses[f"{provider}-{label}"] = f"Error: {str(e)}"

        return Response({
            'prompt': {"text": prompt_text},
            'responses': responses,
            'available_credits': float(user_stats.available_credits),
            'session_id': chat_session.id,
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
                'available_credits': float(stats.available_credits),
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'User stats not found.'}, status=status.HTTP_404_NOT_FOUND)