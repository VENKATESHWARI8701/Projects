import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { connectSocket, askQuestion, disconnectSocket, clearChatHistory } from '../../services/socket';

const Chat = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef(null);

  // Connect to socket when component mounts
  useEffect(() => {
    connectSocket();

    // Disconnect when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    // Add user question to messages
    const userMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading
    setQuestion('');
    setIsLoading(true);
    setCurrentResponse('');

    // Add an empty assistant message that will be updated with streaming content
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    // Ask question and handle streaming response
    const cleanup = askQuestion(
      question,
      // On chunk received
      (chunk) => {
        setCurrentResponse((prev) => prev + ' ' + chunk);

        // Update the last message (which is the assistant's response)
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = newMessages[newMessages.length - 1].content + ' ' + chunk;
          return newMessages;
        });
      },
      // On complete
      () => {
        setIsLoading(false);
        setCurrentResponse('');
      },
      // On error
      (error) => {
        console.error('Error from LLM:', error);
        setIsLoading(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = 'Error: Failed to get response from the model.';
          return newMessages;
        });
      }
    );

    // Clean up event listeners when component unmounts or when a new question is asked
    return cleanup;
  };

  const handleClearHistory = () => {
    clearChatHistory(
      // On success
      () => {
        setMessages([]);
        setCurrentResponse('');
      },
      // On error
      (error) => {
        console.error('Error clearing chat history:', error);
      }
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Chat with your Knowledge Base
        </Typography>
        <Tooltip title="Clear chat history">
          <IconButton onClick={handleClearHistory} color="primary">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          flexGrow: 1,
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input area */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          sx={{ mr: 1 }}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={isLoading || !question.trim()}
          sx={{ p: '10px' }}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;