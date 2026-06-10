import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../api/endpoints';

export const chargerNonLues = createAsyncThunk('notif/nonLues', async () => {
  const { data } = await notificationsApi.nonLues();
  return data.data; // { total, notifications }
});

export const marquerToutLu = createAsyncThunk('notif/toutLu', async () => {
  await notificationsApi.toutMarquerLu();
});

const notifSlice = createSlice({
  name: 'notif',
  initialState: {
    items: [],
    nonLues: 0,
  },
  reducers: {
    ajouter: (state, action) => {
      state.items.unshift(action.payload);
      state.nonLues += 1;
    },
    reinitialiserCompteur: (state) => {
      state.nonLues = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chargerNonLues.fulfilled, (state, action) => {
        state.items = action.payload.notifications || [];
        state.nonLues = action.payload.total || 0;
      })
      .addCase(marquerToutLu.fulfilled, (state) => {
        state.nonLues = 0;
        state.items = state.items.map((n) => ({ ...n, lu: true }));
      });
  },
});

export const { ajouter, reinitialiserCompteur } = notifSlice.actions;
export default notifSlice.reducer;
