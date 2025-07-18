# Knowledge Base Backend Server

This is a simple Express.js server that handles file uploads for the Knowledge Base application.

## Features

- File upload endpoint (`POST /api/upload`)
- Get all files endpoint (`GET /api/files`)
- Delete file endpoint (`DELETE /api/files/:id`)

## Setup

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Start the server: `npm run server`
4. To run both frontend and backend: `npm run dev`

## API Endpoints

### Upload Files

```
POST /api/upload
```

- Accepts multipart/form-data with files field
- Returns uploaded file information

### Get Files

```
GET /api/files
```

- Returns a list of all uploaded files

### Delete File

```
DELETE /api/files/:id
```

- Deletes a file by ID