from django.urls import path
from .views import PromptListCreateView, PromptResponseListView, RegisterView, LoginView, UserStatsView, ComparisonHistoryView

urlpatterns = [
    path('prompts/', PromptListCreateView.as_view(), name='prompt-list-create'),
    path('prompts/<int:prompt_id>/responses/', PromptResponseListView.as_view(), name='prompt-responses'),

    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    path('userstats/', UserStatsView.as_view(), name='user-stats'),
    path('history/', ComparisonHistoryView.as_view(), name='comparison-history'),
]
