# Knowledge Base Application

This project consists of a React frontend and Express backend for managing a knowledge base with AI-powered document Q&A capabilities.

**Live Demo:** [https://projects-theta-ten.vercel.app/](https://projects-theta-ten.vercel.app/)

## Project Structure

```
qa-web-app/
├── frontend/         # React frontend
├── backend/          # Express backend
└── package.json      # Root package.json for running both
```

## Setup

1. Create a `.env` file in the `backend` directory with the following variables:

```
GOOGLE_API_KEY=your_google_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

2. **Google Gemini API Key**: 
   - Visit https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key" and copy the generated key

3. **Pinecone API Key and Index**:
   - Visit https://app.pinecone.io/ and create an account
   - In API Keys, create a key and use that.

4. Install dependencies for both frontend and backend:

```bash
npm run install-all
```

5. Run both frontend and backend concurrently:

```bash
npm run dev
```

## Frontend

The frontend is a React application that allows users to:
- Upload documents (PDF, DOC/DOCX, HTML/HTM) to the knowledge base
- View all files in the knowledge base
- Delete files from the knowledge base
- Chat with an AI assistant that can answer questions based on the uploaded documents

## Backend

The backend is an Express server that:
- Handles file uploads
- Extracts text from multiple file formats (PDF, DOC/DOCX, HTML/HTM)
- Embeds document content using Google's Gemini API
- Stores embeddings in Pinecone vector database

## Deployment

### Frontend
The frontend is deployed on Vercel at [https://projects-theta-ten.vercel.app/](https://projects-theta-ten.vercel.app/)

### Backend
The backend is deployed on Render, which provides:
- Automatic deployments from GitHub
- Environment variable management
