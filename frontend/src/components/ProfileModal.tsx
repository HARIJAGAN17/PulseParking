import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { X, Check, User as UserIcon, AlertCircle } from 'lucide-react';
import { LicensePlate } from './LicensePlate';
import { useToast } from '../context/ToastContext';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdated: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdated }) => {
  const toast = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [plateNumber, setPlateNumber] = useState(user.plateRaw || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.user.updateProfile({
        fullName,
        phoneNumber,
        plateNumber,
      });
      setSuccess(true);
      toast.success('Profile and vehicle plate updated successfully!');
      setTimeout(() => {
        onUpdated(res);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#0D9488]" />
            <h3 className="font-display font-bold text-[#142D4E] text-base">
              Profile & Vehicle Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#142D4E] p-1 rounded hover:bg-[#E2E8F0] cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-lg text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Work Email (Read Only)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-[#64748B] font-mono cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Phone Number (For Valet Relocation Calls)
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
              Primary Vehicle Plate
            </label>
            <input
              type="text"
              required
              placeholder="e.g. KA01AB1234"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
            />
          </div>

          {plateNumber && (
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs font-mono text-[#334155]">Preview Plate:</span>
              <LicensePlate plate={plateNumber} size="md" />
            </div>
          )}

          {/* Primary Action Button (Teal #0D9488) */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] font-mono text-xs font-semibold rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-mono font-bold text-xs rounded-md shadow-sm transition btn-tactile cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Saving updates...</span>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
