"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "../components/WelcomeScreen";
import LoginForm from "../components/LoginForm";
import EmployeeDashboard from "../components/EmployeeDashboard";
import LoadingScreen from "../components/LoadingScreen";
import { useAuthRouting } from "../hooks/useAuthRouting";

export default function Home() {
  const { user, loading, handleAuthSuccess, handleLogout } = useAuthRouting();
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState("welcome");
  const [userType, setUserType] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading screen during initial mount to prevent hydration mismatch
  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    if (user.role === "employee") {
      return <EmployeeDashboard user={user} onLogout={handleLogout} />;
    }
    // For management users, we'll handle this in the management route
    return <LoadingScreen />;
  }

  const handlePortalSelection = (type) => {
    setUserType(type);
    setCurrentView("login");
    setIsSignup(false);
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
  };

  const handleBack = () => {
    setCurrentView("welcome");
    setUserType("");
    setIsSignup(false);
  };

  const handleSubmit = (token, userData) => {
    handleAuthSuccess(token, userData);
  };

  if (currentView === "login") {
    return (
      <LoginForm
        userType={userType}
        isSignup={isSignup}
        onToggleMode={handleToggleMode}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <WelcomeScreen
      onEmployeeLogin={() => handlePortalSelection("employee")}
      onEmployeeSignup={() => {
        handlePortalSelection("employee");
        setIsSignup(true);
      }}
      onManagementLogin={() => handlePortalSelection("management")}
      onManagementSignup={() => {
        handlePortalSelection("management");
        setIsSignup(true);
      }}
    />
  );
}
