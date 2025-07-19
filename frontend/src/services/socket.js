import { io } from 'socket.io-client';

// Create a socket instance
const URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['polling', 'websocket'],
  withCredentials: true
});

// Connect to the WebSocket server
export const connectSocket = () => {
  if (!socket.connected) {
    console.log('Attempting to connect to WebSocket server...');
    socket.connect();

    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log('Successfully connected to WebSocket server with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
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
  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }

  // Set up event listeners for the response
  socket.on('llm-response-chunk', ({ chunk }) => {
    if (onChunk) onChunk(chunk);
  });

  socket.on('llm-response-complete', () => {
    if (onComplete) onComplete();
  });

  socket.on('llm-error', ({ error }) => {
    if (onError) onError(error);
  });

  // Send the question
  socket.emit('ask-question', question);

  // Return a cleanup function to remove listeners
  return () => {
    socket.off('llm-response-chunk');
    socket.off('llm-response-complete');
    socket.off('llm-error');
  };
};

// Clear chat history
export const clearChatHistory = (onSuccess, onError) => {
  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }
  
  // Set up event listener for the response
  socket.on('history-cleared', ({ success }) => {
    if (success && onSuccess) onSuccess();
    if (!success && onError) onError(new Error('Failed to clear history'));
  });
  
  // Send the clear history request
  socket.emit('clear-history');
  
  // Return a cleanup function to remove listeners
  return () => {
    socket.off('history-cleared');
  };
};

export default socket;
