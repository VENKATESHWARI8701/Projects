# Knowledge Base Application

This project consists of a React frontend and Express backend for managing a knowledge base.

## Project Structure

```
qa-web-app/
├── frontend/         # React frontend
├── backend/          # Express backend
└── package.json      # Root package.json for running both
```

## Setup

1. Install dependencies for both frontend and backend:

```bash
npm run install-all
```

2. Run both frontend and backend concurrently:

```bash
npm run dev
```

## Frontend

The frontend is a React application that allows users to:
- Upload PDF files to the knowledge base
- View all files in the knowledge base
- Delete files from the knowledge base

## Backend

The backend is an Express server that:
- Handles file uploads
- Extracts text from PDF files
- Provides API endpoints for managing files

## API Endpoints

- `POST /api/upload` - Upload files
- `GET /api/files` - Get all files
- `DELETE /api/files/:id` - Delete a file by ID