import React from 'react';
import { AvailabilitySummary, User } from '../types';
import { User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  summary: AvailabilitySummary | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  onQuickLogin: (email: string) => void;
  currentView: 'employee' | 'valet' | 'admin';
  onChangeView: (view: 'employee' | 'valet' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  summary,
  onOpenProfile,
  onLogout,
  onQuickLogin,
  currentView,
  onChangeView,
}) => {
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isValet = user?.roles.includes('ROLE_VALET') || isAdmin;

  return (
    <header className="bg-white border-b border-concrete-300 sticky top-0 z-40">
      {/* 1. Main Architectural Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-asphalt-900 text-white flex items-center justify-center font-display font-extrabold text-base tracking-tighter">
            P<span className="text-signal-orange">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-asphalt-900">
                PARKPULSE
              </span>
              <span className="text-[10px] font-mono font-bold uppercase bg-concrete-200 text-asphalt-700 px-1.5 py-0.5 rounded">
                VSM-01
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-asphalt-500">
              KNOW BEFORE YOU GO
            </div>
          </div>
        </div>

        {/* Live Lot Availability Gauge */}
        {summary && (
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-concrete-100 border border-concrete-200 rounded font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse" />
              <span className="text-asphalt-500">AVAILABLE:</span>
              <span className="font-bold text-signal-emerald text-sm">
                {summary.availableSpaces}
              </span>
            </div>
            <div className="text-concrete-300">|</div>
            <div className="flex items-center gap-1">
              <span className="text-asphalt-500">CAPACITY:</span>
              <span className="font-semibold text-asphalt-900">
                {summary.usableCapacity}
              </span>
            </div>
            <div className="text-concrete-300">|</div>
            <div className="flex items-center gap-1">
              <span className="text-asphalt-500">OCCUPANCY:</span>
              <span className="font-semibold text-asphalt-900">
                {Math.round(100 - summary.availabilityPercentage)}%
              </span>
            </div>
          </div>
        )}

        {/* View Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation View Pills */}
          <div className="flex items-center bg-concrete-100 p-1 rounded border border-concrete-200 text-xs font-mono">
            <button
              onClick={() => onChangeView('employee')}
              className={`px-2.5 py-1 rounded transition ${
                currentView === 'employee'
                  ? 'bg-asphalt-900 text-white font-bold'
                  : 'text-asphalt-600 hover:text-asphalt-900'
              }`}
            >
              Floor Deck
            </button>
            {isValet && (
              <button
                onClick={() => onChangeView('valet')}
                className={`px-2.5 py-1 rounded transition ${
                  currentView === 'valet'
                    ? 'bg-asphalt-900 text-white font-bold'
                    : 'text-asphalt-600 hover:text-asphalt-900'
                }`}
              >
                Valet Queue
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onChangeView('admin')}
                className={`px-2.5 py-1 rounded transition ${
                  currentView === 'admin'
                    ? 'bg-asphalt-900 text-white font-bold'
                    : 'text-asphalt-600 hover:text-asphalt-900'
                }`}
              >
                Facility Admin
              </button>
            )}
          </div>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-concrete-100 hover:bg-concrete-200 border border-concrete-300 rounded text-xs transition"
                title="Account Settings & Vehicle"
              >
                <UserIcon className="w-3.5 h-3.5 text-asphalt-700" />
                <span className="font-semibold text-asphalt-900 hidden sm:inline max-w-[120px] truncate">
                  {user.fullName}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-asphalt-500 hover:text-asphalt-900 rounded hover:bg-concrete-100 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* 2. Instant Demo Mode Evaluation Bar */}
      <div className="bg-asphalt-950 text-concrete-300 px-4 py-1.5 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border-t border-asphalt-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-orange" />
          <span className="font-bold text-white uppercase tracking-wider">Demo Evaluation Mode:</span>
          <span className="text-asphalt-400 hidden sm:inline">Switch user persona with 1-click</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onQuickLogin('sarah.chen@acme.com')}
            className="px-2 py-0.5 rounded bg-asphalt-800 hover:bg-asphalt-700 text-concrete-100 transition cursor-pointer"
            title="Logged in with active parked car (GF-03)"
          >
            Sarah Chen (Parked)
          </button>
          <button
            onClick={() => onQuickLogin('david.miller@acme.com')}
            className="px-2 py-0.5 rounded bg-asphalt-800 hover:bg-asphalt-700 text-concrete-100 transition cursor-pointer"
            title="Employee ready to check availability before arriving"
          >
            David Miller (Unparked)
          </button>
          <button
            onClick={() => onQuickLogin('valet@parkpulse.com')}
            className="px-2 py-0.5 rounded bg-asphalt-800 hover:bg-asphalt-700 text-concrete-100 transition cursor-pointer"
            title="Valet operator"
          >
            David Valet (Valet)
          </button>
          <button
            onClick={() => onQuickLogin('admin@parkpulse.com')}
            className="px-2 py-0.5 rounded bg-signal-orange hover:bg-orange-700 text-white font-bold transition cursor-pointer"
            title="System Administrator"
          >
            Facility Admin
          </button>
        </div>
      </div>
    </header>
  );
};
