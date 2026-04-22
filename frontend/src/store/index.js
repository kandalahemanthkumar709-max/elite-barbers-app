import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import servicesReducer from '../slices/servicesSlice';
import bookingsReducer from '../slices/bookingsSlice';
import barbersReducer from '../slices/barbersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    bookings: bookingsReducer,
    barbers: barbersReducer,
  },
});

export default store;
