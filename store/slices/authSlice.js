import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/auth';

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const signin = createAsyncThunk(
  'auth/signin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, credentials);
      const { token, userId, userName } = response.data;
      let role = 'user';
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        role = payload.role || 'user';
      } catch (e) {}
      return { token, userId, userName, role };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/verify`, { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { token, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Reset failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// Update profile thunk (now using PUT for full replace)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ id, name, phone, token }, { rejectWithValue }) => {
    try {
      // Build the full user object for PUT
      const userData = { name, phone };
      const response = await axios.put(
        `${API_URL}/profile/${id}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// Change password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ id, currentPassword, newPassword, token }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/change-password/${id}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

// PUT full profile thunk
export const replaceProfile = createAsyncThunk(
  'auth/replaceProfile',
  async ({ id, userData, token }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/profile/${id}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Full profile update failed');
    }
  }
);

const initialState = {
  token: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null,
  isAuthenticated: !!(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user'))?.token : null),
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
  loading: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signin
      .addCase(signin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
          userId: state.user.userId,
          token: state.user.token,
          role: state.user.role
        };
        localStorage.setItem('user', JSON.stringify(state.user));
        state.message = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Replace Profile (PUT)
      .addCase(replaceProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(replaceProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Always keep userId, token, and role in user object after update
        state.user = {
          ...state.user,
          ...action.payload,
          userId: state.user.userId,
          token: state.user.token,
          role: state.user.role
        };
        localStorage.setItem('user', JSON.stringify(state.user));
        state.message = 'Profile fully replaced successfully';
      })
      .addCase(replaceProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, logout, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer; 