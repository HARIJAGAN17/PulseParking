import { useState, useEffect, useCallback } from 'react';
import { AvailabilitySummary, User } from './types';
import { api } from './api/client';
import { useOccupancyWebSocket } from './hooks/useOccupancyWebSocket';
import { useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ValetDashboard } from './pages/ValetDashboard';
import { AdminPortal } from './pages/AdminPortal';
import { AuthModal } from './pages/AuthModal';
import { ProfileModal } from './components/ProfileModal';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<AvailabilitySummary | null>(null);
  const [currentView, setCurrentView] = useState<'employee' | 'valet' | 'admin'>('employee');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const toast = useToast();

  // 1. Fetch live system summary
  const refreshSummary = useCallback(() => {
    api.occupancy.getSummary()
      .then(setSummary)
      .catch(console.error);
  }, []);

  // 2. Initial Auth & Session Check
  useEffect(() => {
    api.auth.getMe()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          if (user.roles.includes('ROLE_ADMIN')) {
            setCurrentView('admin');
          } else if (user.roles.includes('ROLE_VALET')) {
            setCurrentView('valet');
          } else {
            setCurrentView('employee');
          }
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => {
        setBootstrapping(false);
        refreshSummary();
      });
  }, [refreshSummary]);

  // 3. Live WebSocket STOMP updates
  useOccupancyWebSocket({
    onUpdate: () => {
      // Whenever an occupancy event arrives via STOMP, refresh summary
      refreshSummary();
    },
    onConnect: () => {
      // Upon reconnect, refresh current state from REST (Section 5)
      refreshSummary();
    },
  });

  // 4. Logout handler
  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setCurrentView('employee');
  };

  // 5. Quick Demo Login Switcher
  const handleQuickLogin = async (email: string) => {
    const passwordMap: Record<string, string> = {
      'admin@parkpulse.com': 'Admin@123456',
      'valet@parkpulse.com': 'Valet@123456',
      'sarah.chen@acme.com': 'Employee@123456',
      'david.miller@acme.com': 'Employee@123456',
    };

    const password = passwordMap[email] || 'Employee@123456';
    try {
      const user = await api.auth.login({ email, password });
      setCurrentUser(user);
      if (user.roles.includes('ROLE_ADMIN')) {
        setCurrentView('admin');
      } else if (user.roles.includes('ROLE_VALET')) {
        setCurrentView('valet');
      } else {
        setCurrentView('employee');
      }
      refreshSummary();
    } catch (err: any) {
      toast.error(`Demo login error: ${err.message}`);
    }
  };

  if (bootstrapping) {
    return (
      <div className="h-full flex items-center justify-center bg-concrete-100 font-mono text-xs text-asphalt-500">
        Loading ParkPulse Architecture...
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-concrete-100">
      {/* Universal Tactical Navbar & Demo Switcher */}
      <Navbar
        user={currentUser}
        summary={summary}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main Container */}
      <main className="flex-1">
        {!currentUser ? (
          <AuthModal
            onSuccess={(user) => {
              setCurrentUser(user);
              if (user.roles.includes('ROLE_ADMIN')) {
                setCurrentView('admin');
              } else if (user.roles.includes('ROLE_VALET')) {
                setCurrentView('valet');
              } else {
                setCurrentView('employee');
              }
              refreshSummary();
            }}
          />
        ) : (
          <>
            {currentView === 'employee' && (
              <EmployeeDashboard
                summary={summary}
                onRefreshSummary={refreshSummary}
              />
            )}

            {currentView === 'valet' && (
              <ValetDashboard
                summary={summary}
                onRefreshSummary={refreshSummary}
              />
            )}

            {currentView === 'admin' && (
              <AdminPortal
                onRefreshSummary={refreshSummary}
              />
            )}
          </>
        )}
      </main>

      {/* Profile Settings Modal */}
      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Architectural Footer */}
      <footer className="bg-white border-t border-concrete-300 py-4 px-4 sm:px-6 lg:px-8 text-center text-[11px] font-mono text-asphalt-500">
        PARKPULSE FACILITY INFRASTRUCTURE · KNOW BEFORE YOU GO · MODULAR MONOLITH SPRING BOOT 3 + REACT
      </footer>
    </div>
  );
}

export default App;
