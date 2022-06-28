import { configureStore } from '@reduxjs/toolkit';
import armyReducer from './armySlice';
import listReducer from './listSlice';
import appReducer from './appSlice';
import ftlReducer from './ftlSlice';

export const store = configureStore({
  reducer: {
      army: armyReducer,
      list: listReducer,
      app: appReducer,
      ftl: ftlReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;