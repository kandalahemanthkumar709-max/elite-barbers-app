import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

export const fetchBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/bookings');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/bookings/${id}/cancel`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'bookings/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/bookings/${id}`);
      return id; // Return the ID so we can remove it from state
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/bookings/${id}/status`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
          const index = state.data.findIndex(b => b._id === action.payload._id);
          if (index !== -1) {
              state.data[index] = action.payload;
          }
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
          state.data = state.data.filter(b => b._id !== action.payload);
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
          const index = state.data.findIndex(b => b._id === action.payload._id);
          if (index !== -1) {
              state.data[index] = action.payload;
          }
      });
  },
});

export default bookingsSlice.reducer;
