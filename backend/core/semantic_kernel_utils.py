# semantic_kernel_utils.py

import asyncio
import os
from dotenv import load_dotenv
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import (
    OpenAIChatCompletion,
    AzureChatCompletion,
    OpenAIChatPromptExecutionSettings
)
from semantic_kernel.contents.chat_history import ChatHistory

load_dotenv()

execution_settings = OpenAIChatPromptExecutionSettings(
    max_tokens=1000,
    temperature=0.7,
    top_p=0.95,
)

async def run_openai_chat(prompt_text: str, model_name: str) -> str:
    kernel = Kernel()
    api_key = os.getenv("OPENAI_API_KEY")
    
    service = OpenAIChatCompletion(
        ai_model_id=model_name,
        api_key=api_key,
        service_id="openai-service"
    )
    kernel.add_service(service)

    chat_history = ChatHistory()
    chat_history.add_user_message(prompt_text)

    response_stream = service.get_streaming_chat_message_content(
        chat_history=chat_history,
        settings=execution_settings
    )

    full_response = ""
    async for chunk in response_stream:
        full_response += chunk.content

    return full_response

async def run_azure_chat(prompt_text: str, deployment_name: str, endpoint: str, api_key: str, api_version: str) -> str:
    kernel = Kernel()

    service = AzureChatCompletion(
        deployment_name=deployment_name,
        endpoint=endpoint,
        api_key=api_key,
        service_id="azure-openai-chat"
    )
    kernel.add_service(service)

    chat_history = ChatHistory()
    chat_history.add_user_message(prompt_text)

    response_stream = service.get_streaming_chat_message_content(
        chat_history=chat_history,
        settings=execution_settings
    )

    full_response = ""
    async for chunk in response_stream:
        full_response += chunk.content

    return full_response

def get_openai_response_with_sk(prompt_text, model_name):
    return asyncio.run(run_openai_chat(prompt_text, model_name))

def get_azure_response_with_sk(prompt_text, deployment_name, api_version):
    return asyncio.run(
        run_azure_chat(
            prompt_text=prompt_text,
            deployment_name=deployment_name,
            endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=api_version
        )
    )
    