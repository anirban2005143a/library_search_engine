"use client";

import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import redux_store from "./store";

interface ReduxProviderProps {
  children: ReactNode;
}

// No React.FC generic, just type props directly
export const ReduxProvider = ({ children }: ReduxProviderProps) => {
  return <Provider store={redux_store}>{children}</Provider>;
};