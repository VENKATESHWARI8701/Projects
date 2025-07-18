import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Fade,
  InputAdornment,
  Avatar,
  Chip
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkDown from "react-markdown";
import { connectSocket, askQuestion, disconnectSocket, clearChatHistory } from "../../services/socket";

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! Ask me anything from your Knowledge base." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const chatRef = useRef(null);
  const fullMessageRef = useRef("");

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to socket when component mounts
  useEffect(() => {
    connectSocket();

    // Disconnect when component unmounts
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    fullMessageRef.current = "";
    // Add user message to messages
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input and set loading
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");

    // Add an empty assistant message that will be updated with streaming content
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    // Ask question and handle streaming response
    askQuestion(
      input,
      // On chunk received
      (chunk) => {
        // console.log(chunk);
        if (!chunk || chunk === fullMessageRef.current.slice(-chunk.length)) return;

        fullMessageRef.current += chunk;

        setCurrentResponse(fullMessageRef.current);
        console.log(fullMessageRef.current)
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = fullMessageRef.current;
          return updated;
        });
      },
      // On complete
      () => {
        setIsLoading(false);
      },
      // On error
      (error) => {
        console.error('Error from LLM:', error);
        setIsLoading(false);
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = "Error: Failed to get response from the model.";
          return newMessages;
        });
      }
    );
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

  console.log("currentResponse", currentResponse);
  return (
    <Box sx={{ p: 2 }} className="fade-in">
      <Card elevation={0} sx={{ mb: 4, borderRadius: 3, bgcolor: 'rgba(58, 134, 255, 0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="600" color="primary" gutterBottom>
                Chat with your Knowledge Base
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions about your uploaded documents
              </Typography>
            </Box>
            <Tooltip title="Clear chat history">
              <IconButton
                onClick={handleClearHistory}
                color="primary"
                sx={{
                  bgcolor: 'rgba(58, 134, 255, 0.1)',
                  '&:hover': { bgcolor: 'rgba(58, 134, 255, 0.2)' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          border: '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 3,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: 'rgba(0, 0, 0, 0.01)'
          }}
        >
          {messages.length === 0 && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              opacity: 0.7
            }}>
              <SmartToyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.6 }} />
              <Typography variant="body1" color="text.secondary" align="center">
                Start a conversation with your knowledge base
              </Typography>
            </Box>
          )}

          {messages.map((msg, index) => (
            <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: msg.role === "user" ? 'row-reverse' : 'row',
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: msg.role === "user" ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                    color: msg.role === "user" ? 'white' : 'primary.main',
                    width: 36,
                    height: 36
                  }}
                >
                  {msg.role === "user" ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    maxWidth: "75%",
                    bgcolor: msg.role === "user" ? 'primary.main' : 'background.paper',
                    color: msg.role === "user" ? "#fff" : "text.primary",
                    border: msg.role === "user" ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                    '& p': { m: 0 },
                    '& pre': {
                      bgcolor: msg.role === "user" ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                      p: 1.5,
                      borderRadius: 1,
                      overflowX: 'auto'
                    },
                    '& code': {
                      bgcolor: msg.role === "user" ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                      p: 0.5,
                      borderRadius: 0.5,
                    }
                  }}
                >
                  <ReactMarkDown>{msg.text}</ReactMarkDown>
                </Paper>
              </Box>
            </Fade>
          ))}
          <div ref={chatRef} />
        </Box>

        <Divider />
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: 'background.paper'
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your question..."
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            multiline
            maxRows={3}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    sx={{
                      bgcolor: input.trim() ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { bgcolor: 'rgba(0, 0, 0, 0.08)', color: 'rgba(0, 0, 0, 0.26)' }
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                pr: 0.5
              }
            }}
          />
        </Box>
      </Box>

      {/* {messages.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Chip 
            label="Clear conversation history" 
            color="primary" 
            variant="outlined" 
            onClick={handleClearHistory}
            onDelete={handleClearHistory}
            deleteIcon={<DeleteIcon />}
            sx={{ borderRadius: 3 }}
          />
        </Box>
      )} */}
    </Box>
  );
};

export default ChatInterface;
