"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import store from "../lib/store";
import { initializeFavorites } from "../lib/features/favoriteSlice";
import { getAuthToken } from "../lib/auth";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = () => {
      dispatch(initializeFavorites() as any);
    };

    // Initial check
    checkAuth();

    // Set up interval to check periodically
    const interval = setInterval(checkAuth, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
