# PromptHub

PromptHub is a full-stack web application for comparing and managing prompts across multiple LLM providers (OpenAI, Azure, etc). It features a modern React frontend and a Django REST backend.

## Project Structure

```
PromptHub/
├── backend/   # Django REST API
│   ├── core/  # Django app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/  # React app
│   ├── src/
│   ├── public/
│   └── requirements.txt
└── README.md  # (this file)
```

## Backend (Django)
- REST API for prompt management and LLM responses
- Supports OpenAI and Azure OpenAI
- Uses `.env` for API keys and endpoints

### Setup
1. Install dependencies:
   ```sh
   pip install -r backend/requirements.txt
   ```
2. Create a `.env` file in `backend/` with your API keys:
   ```env
   OPENAI_API_KEY=your-openai-key
   AZURE_OPENAI_API_KEY=your-azure-key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   ```
3. Run migrations and start the server:
   ```sh
   python backend/manage.py migrate
   python backend/manage.py runserver
   ```

## Frontend (React)
- Modern UI for prompt input, model selection, and response comparison
- Uses Tailwind CSS, Framer Motion, and React Syntax Highlighter

### Setup
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   # or
   yarn
   ```
2. Start the development server:
   ```sh
   npm start
   # or
   yarn start
   ```

## Usage
- Select models and enter a prompt in the UI
- Compare responses from different LLM providers
- View prompt/response history

## License
MIT

---
Feel free to customize this README for your team or deployment!
