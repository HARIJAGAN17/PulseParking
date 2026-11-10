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
    <div className="fixed inset-0 z-50 flex justify-end bg-asphalt-950/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-concrete-300 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-concrete-200 flex items-center justify-between bg-concrete-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-asphalt-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              {space.spaceLabel}
            </div>
            <div>
              <h3 className="font-display font-bold text-asphalt-900 text-base leading-tight">
                {isAvailable ? 'Assign Vehicle to Bay' : 'Occupied Bay Details'}
              </h3>
              <span className="text-xs font-mono text-asphalt-500">
                STATUS: {space.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-asphalt-500 hover:text-asphalt-900 p-1.5 rounded hover:bg-concrete-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {showAnimation && (
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-concrete-50 border border-emerald-300 rounded-lg">
              <div className="p-5 border-2 border-dashed border-concrete-400 rounded bg-white w-48 flex flex-col items-center justify-center shadow-tactile">
                <span className="font-mono text-[10px] text-asphalt-500 font-bold mb-2 tracking-wider">BAY {space.spaceLabel}</span>
                <CarAnimation action="park-in" size="lg" />
                <div className="mt-3">
                  <LicensePlate plate={customPlate} size="sm" />
                </div>
              </div>
              <div className="text-sm font-mono font-bold text-signal-emerald mt-4 flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4 text-signal-emerald" />
                VEHICLE ALLOCATED TO {space.spaceLabel}
              </div>
              <span className="text-[11px] text-asphalt-500 mt-1 font-mono">Updating facility blueprint...</span>
            </div>
          )}

          {/* Workflow 1: Bay is AVAILABLE -> Valet Assigns Vehicle */}
          {isAvailable && !showAnimation && (
            <form onSubmit={handleAssign} className="space-y-4">
              {/* Guest / Registered Toggle */}
              <div className="flex items-center justify-between p-3 bg-concrete-100 rounded border border-concrete-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-asphalt-700" />
                  <span className="text-xs font-medium text-asphalt-900">
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
                  className="text-xs font-mono font-semibold text-signal-orange underline hover:text-orange-700"
                >
                  {isGuest ? 'Switch to Employee' : 'Park as Guest'}
                </button>
              </div>

              {!isGuest ? (
                /* Searchable Employee Dropdown */
                <div>
                  <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1.5 font-semibold">
                    Select Employee & Plate
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-asphalt-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search employee name or plate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none font-sans"
                    />
                  </div>

                  {/* Employee Select */}
                  <div className="max-h-48 overflow-y-auto border border-concrete-300 rounded divide-y divide-concrete-200 bg-white">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-3 text-xs text-asphalt-500 text-center font-mono">
                        No matching approved employees found
                      </div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp.id)}
                          className={`p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-concrete-50 transition ${
                            selectedEmployeeId === emp.id ? 'bg-orange-50/60 font-semibold' : ''
                          }`}
                        >
                          <div>
                            <div className="text-asphalt-900">{emp.fullName}</div>
                            <div className="text-[10px] text-asphalt-500 font-mono">{emp.email}</div>
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
                    <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1 font-semibold">
                      Guest Number Plate
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA04EF9988"
                      value={customPlate}
                      onChange={(e) => setCustomPlate(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold uppercase bg-concrete-50 border border-concrete-300 rounded focus:ring-2 focus:ring-asphalt-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-asphalt-700 mb-1">
                      Guest Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Client / Floor 4 Meeting"
                      value={guestNote}
                      onChange={(e) => setGuestNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-concrete-50 border border-concrete-300 rounded focus:ring-1 focus:ring-asphalt-900 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Confirm Plate Preview */}
              {customPlate && (
                <div className="p-3 bg-concrete-100 rounded border border-concrete-200 flex items-center justify-between">
                  <span className="text-xs font-mono text-asphalt-700">Assignment Target:</span>
                  <LicensePlate plate={customPlate} size="md" />
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || !customPlate}
                className="w-full py-3.5 bg-signal-emerald hover:bg-emerald-600 disabled:opacity-50 text-white font-mono font-bold text-sm rounded shadow-sm transition btn-tactile cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Parking Assignment</span>
              </button>
            </form>
          )}

          {/* Workflow 2: Bay is OCCUPIED -> Valet Views Details & Releases Space */}
          {isOccupied && (
            <div className="space-y-4">
              <div className="p-4 bg-concrete-100 rounded border border-concrete-200 text-center">
                <div className="text-xs font-mono text-asphalt-500 uppercase mb-2">Parked Vehicle Plate</div>
                <LicensePlate plate={space.plateNumber} size="lg" />
                
                {space.employeeName && (
                  <div className="mt-3 text-sm font-semibold text-asphalt-900">
                    Driver: {space.employeeName}
                  </div>
                )}
                {space.assignedAt && (
                  <div className="text-xs font-mono text-asphalt-500 mt-1">
                    Parked at: {new Date(space.assignedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {space.assignmentId && (
                <button
                  type="button"
                  onClick={() => onViewContact(space.assignmentId!)}
                  className="w-full py-2.5 px-3 bg-white border border-concrete-300 text-asphalt-900 hover:bg-concrete-50 font-mono text-xs font-medium rounded transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-signal-orange" />
                  <span>View Driver Phone Number</span>
                </button>
              )}

              <div className="pt-4 border-t border-concrete-200">
                <button
                  type="button"
                  onClick={handleRelease}
                  disabled={loading}
                  className="w-full py-3.5 bg-asphalt-900 hover:bg-asphalt-800 disabled:opacity-50 text-white font-mono font-bold text-sm rounded shadow-sm transition btn-tactile cursor-pointer flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Mark Departed & Release Space</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-concrete-50 border-t border-concrete-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-asphalt-600 hover:text-asphalt-950 underline"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  );
};

