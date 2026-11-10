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
      <div className="bg-white border border-concrete-300 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Brand Banner */}
        <div className="p-6 bg-asphalt-900 text-white border-b border-asphalt-800 text-center">
          <div className="inline-flex w-12 h-12 rounded bg-asphalt-800 border border-asphalt-700 items-center justify-center font-display font-extrabold text-xl mb-3">
            P<span className="text-signal-orange">P</span>
          </div>
          <h2 className="font-display font-bold text-xl tracking-tight">PARKPULSE</h2>
          <p className="text-xs font-mono text-concrete-300 uppercase tracking-widest mt-1">
            Know Before You Go
          </p>
        </div>

        {/* Pending Approval Screen */}
        {pendingApproval ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-asphalt-900">
              Registration Submitted
            </h3>
            <p className="text-xs text-asphalt-700 leading-relaxed max-w-xs mx-auto">
              Your employee registration is pending administrator approval. Once approved by facility management, you will be able to log in to access live parking availability.
            </p>
            <div className="pt-4 border-t border-concrete-200">
              <button
                type="button"
                onClick={() => {
                  setPendingApproval(false);
                  setIsRegister(false);
                }}
                className="w-full py-2.5 bg-asphalt-900 text-white font-mono text-xs font-semibold rounded hover:bg-asphalt-800 transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div className="p-6">
            {/* Tabs */}
            <div className="flex border-b border-concrete-200 mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className={`flex-1 py-2 font-bold border-b-2 text-center transition ${
                  !isRegister
                    ? 'border-asphalt-900 text-asphalt-900'
                    : 'border-transparent text-asphalt-500 hover:text-asphalt-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className={`flex-1 py-2 font-bold border-b-2 text-center transition ${
                  isRegister
                    ? 'border-asphalt-900 text-asphalt-900'
                    : 'border-transparent text-asphalt-500 hover:text-asphalt-800'
                }`}
              >
                Self Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Sarah Chen"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                      Phone Number (Private)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 00000"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                      Vehicle Registration Plate
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="KA01AB1234"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold uppercase bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                      />
                    </div>
                    {plateNumber && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-asphalt-500 font-mono">PLATE PREVIEW:</span>
                        <LicensePlate plate={plateNumber} size="sm" />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="sarah.chen@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-asphalt-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-asphalt-900 hover:bg-asphalt-800 disabled:opacity-50 text-white font-mono text-xs font-bold rounded shadow-sm transition btn-tactile cursor-pointer"
              >
                {loading ? 'Processing...' : isRegister ? 'Submit for Approval' : 'Access ParkPulse'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
