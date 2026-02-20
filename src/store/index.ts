import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import orderDetailReducer from './orderDetailSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    instrumentFilters: filterReducer,
    auth: authReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
