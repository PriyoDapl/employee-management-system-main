"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { getRouteForRole } from "../lib/routes";

// Nothing but only a custom hook to handle authentication routing logic
const useAuthRouting = () => {
  const { user, login, logout, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && typeof window !== "undefined") {
      const route = getRouteForRole(user.role);
      if (route && window.location.pathname === "/") {
        router.push(route);
      }
    }
  }, [user, loading, router]);

  const handleAuthSuccess = (token, userData) => {
    login(token, userData);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return {
    user,
    loading,
    handleAuthSuccess,
    handleLogout,
  };
};

export { useAuthRouting };
