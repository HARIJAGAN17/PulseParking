import React, { useState, useEffect } from 'react';
import { ActiveParking, AvailabilitySummary, FloorSpace, ParkingArea, ValetContact } from '../types';
import { api } from '../api/client';
import { FloorGrid } from '../components/FloorGrid';
import { ValetOperationsDrawer } from '../components/ValetOperationsDrawer';
import { ContactModal } from '../components/ContactModal';
import { LicensePlate } from '../components/LicensePlate';
import { Phone, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ValetDashboardProps {
  summary: AvailabilitySummary | null;
  onRefreshSummary: () => void;
}

export const ValetDashboard: React.FC<ValetDashboardProps> = ({ summary, onRefreshSummary }) => {
  const toast = useToast();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [spaces, setSpaces] = useState<FloorSpace[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<ActiveParking[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<FloorSpace | null>(null);
  const [contactModalData, setContactModalData] = useState<ValetContact | null>(null);
  const [activeTab, setActiveTab] = useState<'floor' | 'queue'>('floor');

  // Load buildings
  useEffect(() => {
    api.buildings.getActive()
      .then((blds) => {
        if (blds.length > 0) setSelectedBuildingId(blds[0].id);
      })
      .catch(console.error);
    fetchActiveAssignments();
  }, []);

  // Load areas
  useEffect(() => {
    if (selectedBuildingId) {
      api.areas.getActive(selectedBuildingId)
        .then((floorAreas) => {
          setAreas(floorAreas);
          if (floorAreas.length > 0) setSelectedAreaId(floorAreas[0].id);
        })
        .catch(console.error);
    }
  }, [selectedBuildingId]);

  // Load spaces for area
  const fetchSpaces = () => {
    if (selectedAreaId) {
      api.occupancy.getFloorSpaces(selectedAreaId)
        .then((sp) => {
          setSpaces(sp);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [selectedAreaId]);

  const fetchActiveAssignments = () => {
    api.valet.getActive()
      .then(setActiveAssignments)
      .catch(console.error);
  };

  const handleSelectSpace = (space: FloorSpace) => {
    setSelectedSpace(space);
  };

  const handleViewContact = async (assignmentId: string) => {
    try {
      const contact = await api.valet.getContact(assignmentId);
      setContactModalData(contact);
    } catch (e: any) {
      toast.error(e.message || 'Could not retrieve driver contact');
    }
  };

  const handleReleaseAssignment = async (assignmentId: string) => {
    if (!confirm('Confirm vehicle departure and release parking space?')) return;
    try {
      await api.valet.release(assignmentId);
      toast.success('Vehicle departure processed. Space is now available.');
      fetchSpaces();
      fetchActiveAssignments();
      onRefreshSummary();
    } catch (e: any) {
      toast.error(e.message || 'Failed to release space');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Valet Operations Status Banner (Deep Navy #142D4E) */}
      <div className="bg-[#142D4E] text-white rounded-lg p-5 sm:p-6 shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase text-teal-300 tracking-wider">
              VALET OPERATIONS TERMINAL
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">
            Valet Facility Management
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Select an available bay to assign an incoming vehicle, or release spaces as vehicles depart.
          </p>
        </div>

        {summary && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-[#0E1F36] px-4 py-2.5 rounded-lg border border-[#1B3B66] text-center min-w-[100px]">
              <div className="text-xl font-bold text-[#16A34A]">{summary.availableSpaces}</div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Available</div>
            </div>
            <div className="bg-[#0E1F36] px-4 py-2.5 rounded-lg border border-[#1B3B66] text-center min-w-[100px]">
              <div className="text-xl font-bold text-[#DC2626]">{summary.occupiedSpaces}</div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Occupied</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs (Selected Tab = Teal #0D9488) */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('floor')}
            className={`px-3.5 py-1.5 rounded-md transition font-bold cursor-pointer ${
              activeTab === 'floor'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
            }`}
          >
            Floor Bay Blueprint
          </button>
          <button
            onClick={() => {
              setActiveTab('queue');
              fetchActiveAssignments();
            }}
            className={`px-3.5 py-1.5 rounded-md transition font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
            }`}
          >
            <span>Parked Vehicles Queue</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
              activeTab === 'queue' ? 'bg-[#0E1F36] text-white' : 'bg-[#E2E8F0] text-[#142D4E]'
            }`}>
              {activeAssignments.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchSpaces();
            fetchActiveAssignments();
            onRefreshSummary();
          }}
          className="p-1.5 text-[#64748B] hover:text-[#142D4E] rounded hover:bg-[#F1F5F9] cursor-pointer transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Main Views */}
      {activeTab === 'floor' ? (
        <div className="space-y-4">
          {/* Floor Level Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="font-mono text-xs text-[#64748B] uppercase shrink-0 font-semibold">SELECT DECK:</span>
            {areas.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAreaId(a.id)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedAreaId === a.id
                    ? 'bg-[#0D9488] text-white shadow-sm'
                    : 'bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                }`}
              >
                {a.name} ({a.levelCode})
              </button>
            ))}
          </div>

          <FloorGrid
            spaces={spaces}
            isValetOrAdmin={true}
            onSelectSpace={handleSelectSpace}
            onContactValet={handleViewContact}
            selectedSpaceId={selectedSpace?.spaceId}
          />
        </div>
      ) : (
        /* Queue View: List of all active parked vehicles */
        <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-tactile overflow-hidden">
          <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-[#142D4E]">
              Active Parked Vehicles ({activeAssignments.length})
            </h3>
            <span className="text-xs font-mono text-[#64748B]">
              Click 'Release' upon vehicle exit
            </span>
          </div>

          {activeAssignments.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[#64748B]">
              No vehicles currently parked in facility.
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {activeAssignments.map((a) => (
                <div key={a.assignmentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition">
                  <div className="flex items-center gap-4">
                    <LicensePlate plate={a.plateNumber} size="md" />
                    <div>
                      <div className="font-display font-bold text-base text-[#142D4E]">
                        {a.spaceLabel}
                      </div>
                      <div className="text-xs font-mono text-[#64748B]">
                        {a.buildingName} · {a.areaName} ({a.levelCode})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-[#64748B] hidden sm:block">
                      Parked at {new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewContact(a.assignmentId)}
                      className="px-3 py-1.5 bg-white border border-[#142D4E] text-[#142D4E] hover:bg-[#F1F5F9] rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Contact</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReleaseAssignment(a.assignmentId)}
                      className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-red-700 text-white rounded-md font-bold transition btn-tactile cursor-pointer"
                    >
                      Release Space
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Valet Operations Drawer (for assign or release) */}
      {selectedSpace && (
        <ValetOperationsDrawer
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onAssigned={() => {
            setSelectedSpace(null);
            fetchSpaces();
            fetchActiveAssignments();
            onRefreshSummary();
          }}
          onReleased={() => {
            setSelectedSpace(null);
            fetchSpaces();
            fetchActiveAssignments();
            onRefreshSummary();
          }}
          onViewContact={handleViewContact}
        />
      )}

      {/* Driver Contact Modal (Audited Phone Number View & Copy) */}
      <ContactModal
        contact={contactModalData}
        onClose={() => setContactModalData(null)}
      />
    </div>
  );
};
