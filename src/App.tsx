import React from 'react';
import { MotionConfig } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { AppLayout } from './components/shell/AppLayout';
import { AuthPage } from './pages/AuthPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#7C8896] mt-4">Loading JobTracker...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AppLayout />;
};

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;
