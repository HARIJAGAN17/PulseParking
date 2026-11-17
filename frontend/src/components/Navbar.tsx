import React from 'react';
import { AvailabilitySummary, User } from '../types';
import { User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  summary: AvailabilitySummary | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  currentView: 'employee' | 'valet' | 'admin';
  onChangeView: (view: 'employee' | 'valet' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  summary,
  onOpenProfile,
  onLogout,
  currentView,
  onChangeView,
}) => {
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isValet = user?.roles.includes('ROLE_VALET') || isAdmin;

  return (
    <header className="bg-[#142D4E] text-white border-b border-[#1B3B66] sticky top-0 z-40 shadow-sm">
      {/* 1. Main Professional Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0D9488] text-white flex items-center justify-center font-display font-extrabold text-base tracking-tighter shadow-sm">
            P<span className="text-white/90">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white">
                PARKPULSE
              </span>
              <span className="text-[10px] font-mono font-bold uppercase bg-[#1B3B66] text-teal-200 px-2 py-0.5 rounded border border-teal-500/30">
                Enterprise
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-300">
              Facility Parking Intelligence
            </div>
          </div>
        </div>

        {/* Live Lot Availability Gauge */}
        {summary && (
          <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 bg-[#0E1F36]/80 border border-[#1B3B66] rounded-md font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-slate-300">AVAILABLE:</span>
              <span className="font-bold text-[#16A34A] text-sm">
                {summary.availableSpaces}
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1">
              <span className="text-slate-300">CAPACITY:</span>
              <span className="font-semibold text-white">
                {summary.usableCapacity}
              </span>
            </div>
            <div className="text-slate-600">|</div>
            <div className="flex items-center gap-1">
              <span className="text-slate-300">OCCUPANCY:</span>
              <span className="font-semibold text-white">
                {Math.round(100 - summary.availabilityPercentage)}%
              </span>
            </div>
          </div>
        )}

        {/* View Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation View Pills */}
          <div className="flex items-center bg-[#0E1F36] p-1 rounded-md border border-[#1B3B66] text-xs font-mono">
            <button
              onClick={() => onChangeView('employee')}
              className={`px-3 py-1 rounded transition cursor-pointer ${
                currentView === 'employee'
                  ? 'bg-[#0D9488] text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Floor Deck
            </button>
            {isValet && (
              <button
                onClick={() => onChangeView('valet')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  currentView === 'valet'
                    ? 'bg-[#0D9488] text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Valet Queue
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onChangeView('admin')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-[#0D9488] text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
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
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0E1F36] hover:bg-[#1B3B66] border border-[#1B3B66] rounded-md text-xs transition cursor-pointer text-slate-200 hover:text-white"
                title="Account Settings & Vehicle"
              >
                <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-semibold hidden sm:inline max-w-[120px] truncate">
                  {user.fullName}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
