from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .semantic_kernel_utils import get_openai_response_with_sk, get_azure_response_with_sk
import os
from django.conf import settings
from dotenv import load_dotenv

load_dotenv(os.path.join(settings.BASE_DIR, '.env'))


class PromptListCreateView(APIView):
    def get(self, request):
        # In stateless mode, GET can return an empty list or a placeholder
        return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        prompt_text = request.data.get("text")
        selected_models = request.data.get("models", [
            {"provider": "openai", "label": "GPT-4o"},
            {"provider": "openai", "label": "o4 – mini"},
            {"provider": "openai", "label": "GPT-4.1 -mini"},
            {"provider": "azure", "label": "GPT-4o"},
            {"provider": "azure", "label": "o4 – mini"},
            {"provider": "azure", "label": "gpt-35-turbo"},
        ])

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
            'responses': responses
        }, status=status.HTTP_201_CREATED)


class PromptResponseListView(APIView):
    def get(self, request, prompt_id):
        # Since stateless, we return empty or dummy responses
        return Response([], status=status.HTTP_200_OK)
