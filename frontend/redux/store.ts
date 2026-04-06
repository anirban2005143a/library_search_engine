"use client";

import { configureStore } from "@reduxjs/toolkit";
import catalogueReducer from "./slice/books.slice"; // remove .js for TS
import authReducer from "./slice/auth.slice";

// Create the store
export const redux_store = configureStore({
  reducer: {
    catalogue: catalogueReducer,
    auth: authReducer,
  },
});

// RootState type: represents the whole state of the store
export type RootState = ReturnType<typeof redux_store.getState>;

// AppDispatch type: typed dispatch
export type AppDispatch = typeof redux_store.dispatch;

export default redux_store;