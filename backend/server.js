const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const upload = require("./multer-upload");
const extractText = require("./chunking/extract-text");
const splitText = require("./chunking/chunk");
const { embedAndStore, deleteFromPinecone } = require("./embeddings/pinecone");
const { getAnswerFromModel, saveConversation } = require('./retrieval/retrieval');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.REACT_APP_FRONTEND_URL || "http://localhost:4000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
});
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload endpoint
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let results = [];

    for (const file of req.files) {
      const text = await extractText(file.path);
      const chunks = await splitText(text);

      const metadata = chunks.map((_, i) => ({
        fileName: file.originalname,
        chunkIndex: i,
        fileId: file.filename,
      }));

      await embedAndStore(
        chunks.map(c => c.pageContent),
        metadata.map((m) => ({ ...m, namespace: file.filename }))
      );

      results.push({ file: file.originalname, status: "embedded" });
    }

    return res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({ message: 'Error uploading files' });
  }
});

// Get all files endpoint
app.get('/api/files', (req, res) => {
  try {
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error reading files' });
      }

      const fileList = files.map((filename, index) => ({
        id: index + 1,
        title: filename,
        path: path.join('uploads', filename)
      }));

      return res.status(200).json({ files: fileList });
    });
  } catch (error) {
    console.error('Error getting files:', error);
    return res.status(500).json({ message: 'Error getting files' });
  }
});

// Delete file endpoint
app.delete('/api/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    await deleteFromPinecone(fileId);
    fs.unlink(`./uploads/${fileId}`, (err) => {
      if (err) {
        console.log("Error in unlinking the file")
        return;
      }
      console.log("File deleted successfully");
    })
    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ message: 'Error deleting file' });
  }
});

app.post("/api/ask", async (req, res) => {
  const { question, sessionId = 'api-user' } = req?.body;

  try {
    // For non-streaming responses with chat history
    const answer = await getAnswerFromModel(question, sessionId);
    return res.json({ answer });
  } catch (error) {
    console.error('Error getting answer:', error);
    return res.status(500).json({ error: error.message || 'Unknown error occurred' });
  }
})

// Handle WebSocket connections
io.engine.on('connection_error', (err) => {
  console.log('Connection error:', err.req);      // the request object
  console.log('Error code:', err.code);            // the error code
  console.log('Error message:', err.message);      // the error message
  console.log('Error context:', err.context);      // some additional error context
});

io.on('connection', (socket) => {
  console.log('Client connected with ID:', socket.id);

  // Use socket ID as session ID for chat history
  const sessionId = socket.id;

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });

  socket.on('ask-question', async (question, callback) => {
    console.log('Question received from client', socket.id, ':', question);

    // Send acknowledgment if callback is provided
    if (typeof callback === 'function') {
      callback({ status: 'received' });
    }

    try {
      // Get streaming response from the LLM model with session ID
      const stream = await getAnswerFromModel(question, sessionId);
      console.log('Stream obtained, starting to process chunks');

      // Variable to collect the full response
      let fullResponse = '';

      // Process each chunk from the stream
      for await (const chunk of stream) {
        if (chunk.content) {
          // Collect the full response
          fullResponse += chunk.content;

          // Check if socket is still connected before emitting
          if (socket.connected) {
            socket.emit('llm-response-chunk', { chunk: chunk.content });
            console.log('Sent chunk to client', socket.id);
          } else {
            console.log('Socket disconnected, stopping stream');
            break;
          }
        }
      }

      // Save the complete conversation after streaming finishes
      await saveConversation(sessionId, question, fullResponse);
      console.log('Saved conversation with full response for session', sessionId);

      // Signal that the response is complete if socket is still connected
      if (socket.connected) {
        socket.emit('llm-response-complete');
        console.log('Response complete for client', socket.id);
      }
    } catch (error) {
      console.error('Error streaming response for client', socket.id, ':', error);
      if (socket.connected) {
        socket.emit('llm-error', { error: error.message || 'Unknown error occurred' });
      }
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
