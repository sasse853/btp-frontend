import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notifReducer from './notifSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notif: notifReducer,
  },
});
