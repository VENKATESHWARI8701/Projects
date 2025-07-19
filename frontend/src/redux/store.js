import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import chatReducer from './chat-history-slice';

// Configure persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['chat']
};

const persistedReducer = persistReducer(persistConfig, chatReducer);

export const store = configureStore({
  reducer: {
    chat: persistedReducer,
  },

});

export const persistor = persistStore(store);
