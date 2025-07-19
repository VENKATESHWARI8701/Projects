import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    { role: "ai", text: "Hi! Ask me anything from your Knowledge base." }
  ],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    updateLastAiMessage: (state, action) => {
      // Find the last AI message and update it
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].role === 'ai') {
          state.messages[i].text = action.payload;
          break;
        }
      }
    },
    clearMessages: (state) => {
      state.messages = [
        { role: "ai", text: "Hi! Ask me anything from your Knowledge base." }
      ];
    },
  },
});

export const { addMessage, setMessages, updateLastAiMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
