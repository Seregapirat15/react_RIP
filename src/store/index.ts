import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './filterSlice';
import instrumentsReducer from './instrumentsSlice';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import orderDetailReducer from './orderDetailSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    instrumentFilters: filterReducer,
    instruments: instrumentsReducer,
    auth: authReducer,
    orders: ordersReducer,
    orderDetail: orderDetailReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
