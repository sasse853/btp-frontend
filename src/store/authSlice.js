import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/endpoints';

const utilisateurStocke = () => {
  try {
    return JSON.parse(localStorage.getItem('btp_user')) || null;
  } catch {
    return null;
  }
};

export const connexion = createAsyncThunk('auth/connexion', async (identifiants, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(identifiants);
    return data.data; // { utilisateur, token, token_type }
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Connexion impossible.');
  }
});

export const deconnexion = createAsyncThunk('auth/deconnexion', async () => {
  try {
    await authApi.logout();
  } catch {
    // On purge la session cote client quoi qu'il arrive.
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    utilisateur: utilisateurStocke(),
    token: localStorage.getItem('btp_token') || null,
    statut: 'idle',
    erreur: null,
  },
  reducers: {
    purger: (state) => {
      state.utilisateur = null;
      state.token = null;
      localStorage.removeItem('btp_token');
      localStorage.removeItem('btp_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connexion.pending, (state) => {
        state.statut = 'loading';
        state.erreur = null;
      })
      .addCase(connexion.fulfilled, (state, action) => {
        state.statut = 'succeeded';
        state.utilisateur = action.payload.utilisateur;
        state.token = action.payload.token;
        localStorage.setItem('btp_token', action.payload.token);
        localStorage.setItem('btp_user', JSON.stringify(action.payload.utilisateur));
      })
      .addCase(connexion.rejected, (state, action) => {
        state.statut = 'failed';
        state.erreur = action.payload;
      })
      .addCase(deconnexion.fulfilled, (state) => {
        state.utilisateur = null;
        state.token = null;
        state.statut = 'idle';
        localStorage.removeItem('btp_token');
        localStorage.removeItem('btp_user');
      });
  },
});

export const { purger } = authSlice.actions;
export default authSlice.reducer;

export const selectUtilisateur = (state) => state.auth.utilisateur;
export const selectEstAuthentifie = (state) => Boolean(state.auth.token);
export const selectRole = (state) => state.auth.utilisateur?.role;
