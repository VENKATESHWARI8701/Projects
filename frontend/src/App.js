import './App.css';
import ChatInterface from './modules/chat/chat-with-llm';
import KnowledgeBaseTable from './modules/knowledge-base/knowledge-base-table';
import { AppBar, Button, Toolbar, Typography, Box, Container, Paper, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function App() {
  const [currentView, setCurrentView] = useState('knowledgeBaseTable');

  // Custom theme to ensure tabs don't look disabled when not selected
  const theme = createTheme({
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            opacity: 1,
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
    },
  });

  const handleChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <AppBar position="static" elevation={2} className="app-header">
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600 }} className="app-title">
              AI-Powered Document Q&A
            </Typography>
            <Tabs
              value={currentView}
              onChange={handleChange}
              textColor="inherit"
              indicatorColor="secondary"
              className="nav-tabs"
            >
              <Tab
                value="knowledgeBaseTable"
                label="Knowledge Base"
                icon={<StorageIcon />}
                iconPosition="start"
              />
              <Tab
                value="chat"
                label="Chat"
                icon={<ChatIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        <Paper elevation={0} className="content-container">
          {currentView === 'knowledgeBaseTable' ? <KnowledgeBaseTable /> : <ChatInterface />}
        </Paper>
    </Box>
    </ThemeProvider>
  );
}

export default App;
