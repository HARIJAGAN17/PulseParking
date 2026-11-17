import React, { useState } from 'react';
import { api } from '../api/client';
import { User } from '../types';
import { Car, Lock, Mail, Phone, User as UserIcon, AlertCircle, Clock } from 'lucide-react';
import { LicensePlate } from '../components/LicensePlate';

interface AuthModalProps {
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await api.auth.register({
          email,
          password,
          fullName,
          phoneNumber,
          plateNumber,
        });
        setPendingApproval(true);
      } else {
        const user = await api.auth.login({ email, password });
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Brand Banner (Deep Navy #142D4E) */}
        <div className="p-6 bg-[#142D4E] text-white border-b border-[#1B3B66] text-center">
          <div className="inline-flex w-12 h-12 rounded-lg bg-[#0D9488] items-center justify-center font-display font-extrabold text-xl mb-3 shadow-sm">
            P<span className="text-white/90">P</span>
          </div>
          <h2 className="font-display font-bold text-xl tracking-tight text-white">PARKPULSE</h2>
          <p className="text-xs font-mono text-slate-300 uppercase tracking-widest mt-1">
            Parking. Simplified. Always.
          </p>
        </div>

        {/* Pending Approval Screen */}
        {pendingApproval ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FEF3C7] border border-[#D97706]/30 flex items-center justify-center mx-auto text-[#D97706]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#142D4E]">
              Registration Submitted
            </h3>
            <p className="text-xs text-[#334155] leading-relaxed max-w-xs mx-auto">
              Your employee registration is pending administrator approval. Once approved by facility management, you will be able to log in to access live parking availability.
            </p>
            <div className="pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setPendingApproval(false);
                  setIsRegister(false);
                }}
                className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono text-xs font-semibold rounded-md shadow-sm transition cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div className="p-6">
            {/* Tabs (Active = Teal #0D9488) */}
            <div className="flex border-b border-[#E2E8F0] mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`flex-1 py-2 font-bold border-b-2 text-center transition cursor-pointer ${
                  !isRegister
                    ? 'border-[#0D9488] text-[#0D9488]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Employee Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`flex-1 py-2 font-bold border-b-2 text-center transition cursor-pointer ${
                  isRegister
                    ? 'border-[#0D9488] text-[#0D9488]'
                    : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                New Registration
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-lg text-[#991B1B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                      Vehicle License Plate
                    </label>
                    <div className="relative">
                      <Car className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. KA04AB1234"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                      />
                    </div>
                  </div>

                  {plateNumber && (
                    <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#334155]">Plate Preview:</span>
                      <LicensePlate plate={plateNumber} size="sm" />
                    </div>
                  )}
                </>
              )}

              {/* Primary Submit Button (Teal #0D9488) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-mono font-bold text-xs rounded-md shadow-sm transition btn-tactile cursor-pointer"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : isRegister ? (
                    <span>Submit Registration for Approval</span>
                  ) : (
                    <span>Sign In to Parking Deck</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
