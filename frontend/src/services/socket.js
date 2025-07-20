import { io } from 'socket.io-client';

// Create a socket instance
const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['polling', 'websocket'],
  withCredentials: true
});

// Connect to the WebSocket server
export const connectSocket = () => {
  // Remove any existing listeners to prevent duplicates
  socket.off('connect');
  socket.off('connect_error');
  socket.off('disconnect');

  // Add connection event listeners for debugging
  socket.on('connect', () => {
    console.log('Successfully connected to WebSocket server with ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
    // Try to reconnect with a different transport if the current one fails
    if (socket.io.opts.transports.includes('websocket')) {
      console.log('Falling back to polling transport');
      socket.io.opts.transports = ['polling'];
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from WebSocket server:', reason);
    if (reason === 'io server disconnect') {
      // The server has forcefully disconnected the socket
      console.log('Attempting to reconnect...');
      socket.connect();
    }
  });

  if (!socket.connected) {
    console.log('Attempting to connect to WebSocket server...');
    socket.connect();
  }

  return socket;
};

// Disconnect from the WebSocket server
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Ask a question and get a streaming response
export const askQuestion = (question, onChunk, onComplete, onError) => {
  // Remove any existing listeners to prevent duplicates
  socket.off('llm-response-chunk');
  socket.off('llm-response-complete');
  socket.off('llm-error');

  // Connect if not already connected
  if (!socket.connected) {
    console.log('Socket not connected, attempting to connect...');
    socket.connect();

    // Wait for connection before sending the question
    socket.once('connect', () => {
      console.log('Connected, now sending question');
      sendQuestionWhenReady();
    });
  } else {
    sendQuestionWhenReady();
  }

  function sendQuestionWhenReady() {
    // Set up event listeners for the response
    socket.on('llm-response-chunk', ({ chunk }) => {
      console.log('Received chunk:', chunk);
      if (onChunk) onChunk(chunk);
    });

    socket.on('llm-response-complete', () => {
      console.log('Response complete');
      if (onComplete) onComplete();

      // Clean up listeners after completion
      socket.off('llm-response-chunk');
      socket.off('llm-response-complete');
      socket.off('llm-error');
    });

    socket.on('llm-error', ({ error }) => {
      console.error('LLM error:', error);
      if (onError) onError(error);

      // Clean up listeners after error
      socket.off('llm-response-chunk');
      socket.off('llm-response-complete');
      socket.off('llm-error');
    });

    // Send the question with acknowledgment
    socket.emit('ask-question', question, (acknowledgment) => {
      if (acknowledgment && acknowledgment.error) {
        console.error('Error sending question:', acknowledgment.error);
        if (onError) onError(acknowledgment.error);
      } else {
        console.log('Question sent successfully');
      }
    });
  }

  // Return a cleanup function to remove listeners
  return () => {
    socket.off('llm-response-chunk');
    socket.off('llm-response-complete');
    socket.off('llm-error');
  };
};


export default socket;
