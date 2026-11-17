import React, { useState, useEffect } from 'react';
import { FloorSpace, User } from '../types';
import { api } from '../api/client';
import { LicensePlate } from './LicensePlate';
import { CarAnimation } from './CarAnimation';
import { X, Check, Car, UserCheck, Search, AlertCircle, Phone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ValetOperationsDrawerProps {
  space: FloorSpace | null;
  onClose: () => void;
  onAssigned: () => void;
  onReleased: () => void;
  onViewContact: (assignmentId: string) => void;
}

export const ValetOperationsDrawer: React.FC<ValetOperationsDrawerProps> = ({
  space,
  onClose,
  onAssigned,
  onReleased,
  onViewContact,
}) => {
  const toast = useToast();
  const [eligibleEmployees, setEligibleEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [customPlate, setCustomPlate] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [guestNote, setGuestNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (space && space.status === 'AVAILABLE') {
      api.valet.getEligibleEmployees()
        .then((res) => {
          setEligibleEmployees(res);
          if (res.length > 0 && !isGuest) {
            setSelectedEmployeeId(res[0].id);
            setCustomPlate(res[0].plateRaw || '');
          }
        })
        .catch(console.error);
    }
  }, [space, isGuest]);

  if (!space) return null;

  const isAvailable = space.status === 'AVAILABLE';
  const isOccupied = space.status === 'OCCUPIED';

  const filteredEmployees = eligibleEmployees.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(term) ||
      (e.plateRaw && e.plateRaw.toLowerCase().includes(term)) ||
      e.email.toLowerCase().includes(term)
    );
  });

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = eligibleEmployees.find((e) => e.id === empId);
    if (emp && emp.plateRaw) {
      setCustomPlate(emp.plateRaw);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.valet.assign({
        spaceId: space.spaceId,
        plateNumber: customPlate,
        employeeId: isGuest ? undefined : (selectedEmployeeId || undefined),
        isGuest,
        guestNote: isGuest ? guestNote : undefined,
      });

      setShowAnimation(true);
      toast.success(`Vehicle allocated to Bay ${space.spaceLabel}!`);
      setTimeout(() => {
        setLoading(false);
        onAssigned();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to assign space');
      toast.error(err.message || 'Failed to assign space');
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!space.assignmentId) return;
    setError(null);
    setLoading(true);

    try {
      await api.valet.release(space.assignmentId);
      toast.success(`Bay ${space.spaceLabel} released. Space is now available.`);
      setLoading(false);
      onReleased();
    } catch (err: any) {
      setError(err.message || 'Failed to release space');
      toast.error(err.message || 'Failed to release space');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200">
        {/* Drawer Header (Deep Navy #142D4E accents) */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="px-2.5 py-1 min-w-[42px] h-8 rounded-md bg-[#142D4E] text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm whitespace-nowrap shrink-0">
              {space.spaceLabel}
            </div>
            <div>
              <h3 className="font-display font-bold text-[#142D4E] text-base leading-tight">
                {isAvailable ? 'Assign Vehicle to Bay' : 'Occupied Bay Details'}
              </h3>
              <span className={`text-xs font-mono font-semibold ${isAvailable ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                STATUS: {isAvailable ? 'AVAILABLE' : 'OCCUPIED'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#142D4E] p-1.5 rounded hover:bg-[#E2E8F0] cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-[#FEE2E2] border border-[#DC2626]/30 rounded-lg text-[#991B1B] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <span>{error}</span>
            </div>
          )}

          {showAnimation && (
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-[#DCFCE7]/40 border border-[#16A34A]/40 rounded-lg">
              <div className="p-5 border-2 border-dashed border-[#CBD5E1] rounded-lg bg-white w-48 flex flex-col items-center justify-center shadow-tactile">
                <span className="font-mono text-[10px] text-[#64748B] font-bold mb-2 tracking-wider">BAY {space.spaceLabel}</span>
                <CarAnimation action="park-in" size="lg" />
                <div className="mt-3">
                  <LicensePlate plate={customPlate} size="sm" />
                </div>
              </div>
              <div className="text-sm font-mono font-bold text-[#166534] mt-4 flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 text-[#16A34A]" />
                VEHICLE ALLOCATED TO {space.spaceLabel}
              </div>
              <span className="text-[11px] text-[#64748B] mt-1 font-mono">Updating facility blueprint...</span>
            </div>
          )}

          {/* Workflow 1: Bay is AVAILABLE -> Valet Assigns Vehicle */}
          {isAvailable && !showAnimation && (
            <form onSubmit={handleAssign} className="space-y-4">
              {/* Guest / Registered Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#142D4E]" />
                  <span className="text-xs font-medium text-[#0F172A]">
                    {isGuest ? 'Guest / Unregistered Vehicle' : 'Approved Employee Vehicle'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(!isGuest);
                    if (!isGuest) {
                      setCustomPlate('');
                      setSelectedEmployeeId('');
                    }
                  }}
                  className="text-xs font-mono font-semibold text-[#0D9488] hover:text-[#0F766E] underline cursor-pointer"
                >
                  {isGuest ? 'Switch to Employee' : 'Park as Guest'}
                </button>
              </div>

              {!isGuest ? (
                /* Searchable Employee Dropdown */
                <div>
                  <label className="block text-xs font-mono uppercase text-[#334155] mb-1.5 font-semibold">
                    Select Employee & Plate
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search employee name or plate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none font-sans text-[#0F172A]"
                    />
                  </div>

                  {/* Employee Select */}
                  <div className="max-h-48 overflow-y-auto border border-[#E2E8F0] rounded-md divide-y divide-[#E2E8F0] bg-white">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-3 text-xs text-[#64748B] text-center font-mono">
                        No matching approved employees found
                      </div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp.id)}
                          className={`p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8FAFC] transition ${
                            selectedEmployeeId === emp.id ? 'bg-teal-50 border-l-2 border-l-[#0D9488] font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="text-[#0F172A]">{emp.fullName}</div>
                            <div className="text-[10px] text-[#64748B] font-mono">{emp.email}</div>
                          </div>
                          <LicensePlate plate={emp.plateRaw} size="sm" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Guest Plate Entry */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                      Guest Number Plate
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA04EF9988"
                      value={customPlate}
                      onChange={(e) => setCustomPlate(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold uppercase bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#334155] mb-1 font-semibold">
                      Guest Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Client / Floor 4 Meeting"
                      value={guestNote}
                      onChange={(e) => setGuestNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none text-[#0F172A]"
                    />
                  </div>
                </div>
              )}

              {/* Confirm Plate Preview */}
              {customPlate && (
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#334155]">Assignment Target:</span>
                  <LicensePlate plate={customPlate} size="md" />
                </div>
              )}

              {/* Primary Action Button (Teal #0D9488 per Design Guidelines) */}
              <button
                type="submit"
                disabled={loading || !customPlate}
                className="w-full py-3 bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-mono font-bold text-sm rounded-md shadow-sm transition btn-tactile cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Parking Assignment</span>
              </button>
            </form>
          )}

          {/* Workflow 2: Bay is OCCUPIED -> Valet Views Details & Releases Space */}
          {isOccupied && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-center">
                <div className="text-xs font-mono text-[#64748B] uppercase mb-2">Parked Vehicle Plate</div>
                <LicensePlate plate={space.plateNumber} size="lg" />
                
                {space.employeeName && (
                  <div className="mt-3 text-sm font-semibold text-[#0F172A]">
                    Driver: {space.employeeName}
                  </div>
                )}
                {space.assignedAt && (
                  <div className="text-xs font-mono text-[#64748B] mt-1">
                    Parked at: {new Date(space.assignedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {space.assignmentId && (
                <button
                  type="button"
                  onClick={() => onViewContact(space.assignmentId!)}
                  className="w-full py-2.5 px-3 bg-white border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] font-mono text-xs font-semibold rounded-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>View Driver Phone Number</span>
                </button>
              )}

              <div className="pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleRelease}
                  disabled={loading}
                  className="w-full py-3 bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 text-white font-mono font-bold text-sm rounded-md shadow-sm transition btn-tactile cursor-pointer flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Mark Departed & Release Space</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#64748B] hover:text-[#0F172A] underline cursor-pointer"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  );
};
