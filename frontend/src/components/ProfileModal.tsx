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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt-950/60 backdrop-blur-xs">
      <div className="bg-white border border-concrete-300 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-concrete-200 flex items-center justify-between bg-concrete-50">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-asphalt-900" />
            <h3 className="font-display font-bold text-asphalt-900 text-base">
              Profile & Vehicle Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-asphalt-500 hover:text-asphalt-900 p-1 rounded hover:bg-concrete-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-signal-emerald shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1">
              Work Email Address
            </label>
            <div className="text-xs font-mono text-asphalt-500 bg-concrete-100 border border-concrete-200 px-3 py-2 rounded">
              {user.email}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
              Private Phone Number
            </label>
            <input
              type="text"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
              placeholder="+91 98765 00000"
            />
            <p className="text-[11px] text-asphalt-500 mt-1">
              Your phone number is strictly private and only visible to authorized valets during active parking.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
              Vehicle Registration Plate
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-bold uppercase bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
              placeholder="e.g. KA01AB1234"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-asphalt-500 font-mono">PLATE PREVIEW:</span>
              <LicensePlate plate={plateNumber || 'SAMPLE'} size="sm" />
            </div>
          </div>

          <div className="pt-3 border-t border-concrete-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-asphalt-600 hover:text-asphalt-950 bg-white border border-concrete-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-asphalt-900 hover:bg-asphalt-800 rounded transition btn-tactile cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

