import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/cart';

// Helper to get token from user object in localStorage
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(API_URL, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.post(API_URL, itemData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.put(`${API_URL}/update`, itemData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.delete(`${API_URL}/remove`, { 
        data: itemData, 
        headers 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove item from cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    itemCount: 0,
    shipping: 210,
    finalTotal: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.finalTotal = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        state.itemCount = action.payload.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        state.finalTotal = state.total + state.shipping;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        state.itemCount = action.payload.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        state.finalTotal = state.total + state.shipping;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        state.itemCount = action.payload.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        state.finalTotal = state.total + state.shipping;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        state.itemCount = action.payload.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        state.finalTotal = state.total + state.shipping;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer; 