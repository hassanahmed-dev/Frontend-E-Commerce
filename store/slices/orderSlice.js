import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async ({ orderData, token }, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Order creation failed');
      }
      const responseData = await res.json();
      console.log('Order created successfully:', responseData);
      return responseData;
    } catch (err) {
      console.error('Create order error:', err.message, 'Payload:', orderData);
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch user orders');
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch user orders error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch all orders');
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch all orders error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status, reason, cancelledBy, token }, { rejectWithValue }) => {
    try {
      console.log('Updating status. OrderId:', orderId, 'Status:', status, 'Reason:', reason, 'CancelledBy:', cancelledBy, 'Token:', token);
      if (!token) throw new Error('Authentication token is missing');
      if (!isValidObjectId(orderId)) throw new Error('Invalid or missing MongoDB _id for order status update');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reason, cancelledBy }),
      });
      if (!res.ok) {
        const errorData = await res.text(); // Use text() to capture raw response
        console.error('Backend response error. Status:', res.status, 'Body:', errorData);
        throw new Error(`Failed to update order status: ${res.status} - ${errorData || 'Unknown error'}`);
      }
      const responseData = await res.json();
      console.log('Status updated successfully:', responseData);
      return responseData;
    } catch (err) {
      console.error('Update order status error:', err.message, 'Stack:', err.stack);
      return rejectWithValue(err.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason, token }, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      if (!isValidObjectId(orderId)) throw new Error('Invalid or missing MongoDB _id for order cancel');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const errorData = await res.text();
        console.error('Backend response error. Status:', res.status, 'Body:', errorData);
        throw new Error(`Failed to cancel order: ${res.status} - ${errorData || 'Unknown error'}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Cancel order error:', err.message, 'OrderId:', orderId);
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRevenueData = createAsyncThunk(
  'order/fetchRevenueData',
  async (token, { rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/api/orders/revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch revenue data');
      }
      return await res.json();
    } catch (err) {
      console.error('Fetch revenue data error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

function normalizeOrder(order = {}) {
  return {
    id: order.id || '', // 4-digit id only
    _id: order._id || '', // only MongoDB ObjectId
    orderStatus: (order.orderStatus || 'pending').toLowerCase(),
    cancellationReason: order.cancellationReason || '',
    cancelledBy: order.cancelledBy || '',
    cartItems: Array.isArray(order.cartItems) ? order.cartItems : [],
    customer: {
      name: order.userName || (order.customer?.name || ''),
      phone: order.billingDetails?.phone || '',
      email: order.billingDetails?.email || '',
    },
    shipping: {
      country: order.shippingDetails?.country || order.billingDetails?.country || '',
      state: order.shippingDetails?.state || order.billingDetails?.state || '',
      city: order.shippingDetails?.city || order.billingDetails?.city || '',
      address: order.shippingDetails?.address || order.billingDetails?.address || '',
      postalCode: order.billingDetails?.postalCode || '',
      paymentMethod: order.paymentMethod || '',
      invoiceNo: order.id || '',
    },
    total: order.finalTotal || order.total || 0,
    statusUpdates: Array.isArray(order.statusUpdates) ? order.statusUpdates : [],
    createdAt: order.createdAt || new Date(),
    billingDetails: order.billingDetails || {},
    shippingDetails: order.shippingDetails || {},
    paymentMethod: order.paymentMethod || '',
  };
}

function isValidObjectId(id) {
  return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]{24}$/.test(id);
}

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    orders: [],
    allOrders: [],
    revenueData: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.order = null;
      state.success = false;
      state.error = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.order = normalizeOrder(action.payload);
          state.orders = [normalizeOrder(action.payload), ...state.orders];
        }
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Order creation failed';
        state.success = false;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload.map(normalizeOrder) : [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user orders';
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = Array.isArray(action.payload) ? action.payload.map(normalizeOrder) : [];
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch all orders';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const updatedOrder = normalizeOrder(action.payload);
          state.orders = state.orders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
          state.allOrders = state.allOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        }
        state.success = true;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update order status';
        state.success = false;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const updatedOrder = normalizeOrder(action.payload);
          state.orders = state.orders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
          state.allOrders = state.allOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        }
        state.success = true;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to cancel order';
        state.success = false;
      })
      .addCase(fetchRevenueData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch revenue data';
      });
  },
});

export const { resetOrderState, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;