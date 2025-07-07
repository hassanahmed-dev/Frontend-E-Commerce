import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/wishlist';

// Helper to get token from user object in localStorage
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL, { headers: getAuthHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/add`, { productId }, { headers: getAuthHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/remove`, { productId }, { headers: getAuthHeaders() });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false, error: null },
  reducers: { resetWishlist: (state) => { state.products = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.products = action.payload; })
      .addCase(addToWishlist.fulfilled, (state, action) => { state.products = action.payload; })
      .addCase(removeFromWishlist.fulfilled, (state, action) => { state.products = action.payload; });
  }
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer; 