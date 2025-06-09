'use client';

import { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LoginForm from './LoginForm';

const LandingPage = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState('');

  const handleEmployeeLogin = () => {
    setUserType('employee');
    setShowLogin(true);
    setIsSignup(false);
  };

  const handleEmployeeSignup = () => {
    setUserType('employee');
    setShowLogin(true);
    setIsSignup(true);
  };

  const handleManagementLogin = () => {
    setUserType('management');
    setShowLogin(true);
    setIsSignup(false);
  };

  const handleManagementSignup = () => {
    setUserType('management');
    setShowLogin(true);
    setIsSignup(true);
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
  };

  const handleBack = () => {
    setShowLogin(false);
    setUserType('');
  };

  const handleSubmit = (token, userData) => {
    onAuthSuccess(token, userData);
  };

  if (showLogin) {
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
      onEmployeeLogin={handleEmployeeLogin}
      onEmployeeSignup={handleEmployeeSignup}
      onManagementLogin={handleManagementLogin}
      onManagementSignup={handleManagementSignup}
    />
  );
}

export default LandingPage;
