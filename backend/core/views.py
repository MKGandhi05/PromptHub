from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Prompt, PromptResponse
from .serializers import PromptSerializer, PromptResponseSerializer
import openai
import requests
from django.conf import settings

class PromptListCreateView(APIView):
    def get(self, request):
        prompts = Prompt.objects.all().order_by('-created_at')
        serializer = PromptSerializer(prompts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PromptSerializer(data=request.data)
        if serializer.is_valid():
            prompt = serializer.save()
            prompt_text = prompt.text
            # Get models from request or use all
            selected_models = request.data.get('models', [
                {"provider": "openai", "label": "GPT-4o"},
                {"provider": "openai", "label": "o4 – mini"},
                {"provider": "openai", "label": "GPT-4.1 -mini"},
                {"provider": "azure", "label": "GPT-4o"},
                {"provider": "azure", "label": "o4 – mini"},
                {"provider": "azure", "label": "GPT-4.1 -mini"},
            ])
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
                    "GPT-4.1 -mini": {
                        "deployment": "gpt-4.1-mini",
                        "api_version": "2024-12-01-preview"
                    }
                }
            }
            responses = {}
            for model in selected_models:
                provider = model.get("provider", "openai")
                label = model.get("label")
                if provider == "openai":
                    model_id = model_map.get(provider, {}).get(label)
                    if model_id:
                        responses[f"openai-{label}"] = self.get_openai_response(prompt_text, model_id)
                elif provider == "azure":
                    model_config = model_map.get(provider, {}).get(label)
                    if model_config:
                        responses[f"azure-{label}"] = self.get_azure_openai_response(
                            prompt_text, 
                            model_config["deployment"],
                            model_config["api_version"]
                        )
            PromptResponse.objects.create(prompt=prompt, response_text=responses.get("openai-GPT-4o", ""))
            return Response({
                'prompt': serializer.data,
                'responses': responses
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_openai_response(self, prompt_text, model="gpt-3.5-turbo"):
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        if not api_key:
            return 'OpenAI API key not set in settings.'
        try:
            client = openai.OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt_text}]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f'Error: {str(e)}'

    def get_azure_openai_response(self, prompt_text, deployment_name, api_version):
        api_key = getattr(settings, 'AZURE_OPENAI_API_KEY', None)
        endpoint = getattr(settings, 'AZURE_OPENAI_ENDPOINT', None)
        if not api_key or not endpoint:
            return 'Azure OpenAI API key or endpoint not set in settings.'
        try:
            url = f"{endpoint}/openai/deployments/{deployment_name}/chat/completions?api-version={api_version}"
            headers = {
                "api-key": api_key,
                "Content-Type": "application/json"
            }
            data = {
                "messages": [{"role": "user", "content": prompt_text}]
            }
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return f"Azure Error: {response.text}"
        except Exception as e:
            return f'Azure Error: {str(e)}'

class PromptResponseListView(APIView):
    def get(self, request, prompt_id):
        responses = PromptResponse.objects.filter(prompt_id=prompt_id).order_by('-created_at')
        serializer = PromptResponseSerializer(responses, many=True)
        return Response(serializer.data)