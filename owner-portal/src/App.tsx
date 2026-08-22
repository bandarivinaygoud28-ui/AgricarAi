import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyResourcesPage } from './pages/MyResourcesPage';
import { AddResourcePage } from './pages/AddResourcePage';
import { BookingsPage } from './pages/BookingsPage';
import { JobsPage } from './pages/JobsPage';
import { EarningsPage } from './pages/EarningsPage';
import { RatingsPage } from './pages/RatingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [editResourceId, setEditResourceId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center text-2xl animate-pulse">
            🚜
          </div>
          <span>Loading AgriCare Owner Portal...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login or Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView('login')}
          onSuccess={() => setCurrentTab('dashboard')}
        />
      );
    }
    return (
      <LoginPage
        onSwitchToRegister={() => setAuthView('register')}
        onSuccess={() => setCurrentTab('dashboard')}
      />
    );
  }

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    setEditResourceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToEdit = (resourceId: number) => {
    setEditResourceId(resourceId);
    setCurrentTab('edit-resource');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onNavigate={handleNavigate}
        />

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}

          {currentTab === 'resources' && (
            <MyResourcesPage
              onNavigateToAdd={() => handleNavigate('add-resource')}
              onNavigateToEdit={handleNavigateToEdit}
              onNavigateToBookings={() => handleNavigate('bookings')}
            />
          )}

          {currentTab === 'add-resource' && (
            <AddResourcePage
              editResourceId={null}
              onSuccess={() => handleNavigate('resources')}
              onCancel={() => handleNavigate('resources')}
            />
          )}

          {currentTab === 'edit-resource' && (
            <AddResourcePage
              editResourceId={editResourceId}
              onSuccess={() => handleNavigate('resources')}
              onCancel={() => handleNavigate('resources')}
            />
          )}

          {currentTab === 'bookings' && <BookingsPage />}

          {currentTab === 'jobs' && <JobsPage showCompletedOnly={false} />}

          {currentTab === 'completed-jobs' && <JobsPage showCompletedOnly={true} />}

          {currentTab === 'earnings' && <EarningsPage />}

          {currentTab === 'ratings' && <RatingsPage />}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
