import './App.css';
import ChatInterface from './modules/chat/chat-with-llm';
import KnowledgeBaseTable from './modules/knowledge-base/knowledge-base-table';
import { AppBar, Button, Toolbar, Typography, Box, Container, Paper, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';

function App() {
  const [currentView, setCurrentView] = useState('knowledgeBaseTable');

  const handleChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  return (
    <Box className="app-container">
      <AppBar position="static" elevation={0} className="app-header">
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
      
      <Container maxWidth="xl" className="main-content">
        <Paper elevation={0} className="content-container">
          {currentView === 'knowledgeBaseTable' ? <KnowledgeBaseTable /> : <ChatInterface />}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;
