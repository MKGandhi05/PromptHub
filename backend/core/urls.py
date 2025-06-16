from django.urls import path
from .views import PromptListCreateView, PromptResponseListView

urlpatterns = [
    path('prompts/', PromptListCreateView.as_view(), name='prompt-list-create'),
    path('prompts/<int:prompt_id>/responses/', PromptResponseListView.as_view(), name='prompt-responses'),
]
