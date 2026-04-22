import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

export const fetchBarbers = createAsyncThunk(
  'barbers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/barbers');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const barbersSlice = createSlice({
  name: 'barbers',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBarbers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBarbers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBarbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });
  },
});

export default barbersSlice.reducer;
