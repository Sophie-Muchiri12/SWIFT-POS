import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import BASE_URL from "../../utils/config";

// user login
export const handleLoginUser = createAsyncThunk(
  "auth/handleLoginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/v1/login/`, { username, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// user logout
export const handleLogoutUser = createAsyncThunk(
  "auth/handleLogoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token"); 
      if (!refreshToken) throw new Error("No refresh token found.");

      const response = await axios.post(`${BASE_URL}/v1/logout/`, { refresh: refreshToken });

      if (response.status === 200) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : { error: "Logout failed." });
    }
  }
);

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'isAuthenticated', 'lastActivity'],
};

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  lastActivity: Date.now(), 
};

const authenticationSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLoginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleLoginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        state.lastActivity = Date.now();
        console.log("User logged in successfully:", state.user);
      })
      .addCase(handleLoginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Handle Logout
      .addCase(handleLogoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.lastActivity = null;
        console.log("User logged out successfully");
      })
      .addCase(handleLogoutUser.rejected, (state, action) => {
        state.error = action.payload.error || "Logout failed.";
      });
  },
});

// Persist reducer for authentication
const persistedAuthReducer = persistReducer(persistConfig, authenticationSlice.reducer);

export const { logout, updateLastActivity } = authenticationSlice.actions;
export default persistedAuthReducer;
