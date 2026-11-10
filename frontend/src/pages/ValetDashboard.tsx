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
      {/* 1. Valet Operations Status Banner */}
      <div className="bg-asphalt-900 text-white rounded-lg p-5 sm:p-6 shadow-tactile flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase text-signal-emerald tracking-wider">
              OPERATIONAL TERMINAL
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">
            Valet Facility Management
          </h2>
          <p className="text-xs text-asphalt-400 mt-0.5">
            Tap an open bay to allocate an arriving vehicle, or manage active parked vehicles.
          </p>
        </div>

        {summary && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-asphalt-800 px-3.5 py-2 rounded border border-asphalt-700 text-center">
              <div className="text-xl font-bold text-signal-emerald">{summary.availableSpaces}</div>
              <div className="text-[10px] text-asphalt-400 uppercase">Available Bays</div>
            </div>
            <div className="bg-asphalt-800 px-3.5 py-2 rounded border border-asphalt-700 text-center">
              <div className="text-xl font-bold text-signal-amber">{summary.occupiedSpaces}</div>
              <div className="text-[10px] text-asphalt-400 uppercase">Active Parked</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-concrete-300 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('floor')}
            className={`px-3 py-1.5 rounded transition font-bold ${
              activeTab === 'floor'
                ? 'bg-asphalt-900 text-white'
                : 'bg-concrete-200 text-asphalt-700 hover:bg-concrete-300'
            }`}
          >
            Floor Bay Blueprint
          </button>
          <button
            onClick={() => {
              setActiveTab('queue');
              fetchActiveAssignments();
            }}
            className={`px-3 py-1.5 rounded transition font-bold flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-asphalt-900 text-white'
                : 'bg-concrete-200 text-asphalt-700 hover:bg-concrete-300'
            }`}
          >
            <span>Parked Vehicles Queue</span>
            <span className="px-1.5 py-0.2 bg-signal-orange text-white text-[10px] rounded-full">
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
          className="p-1.5 text-asphalt-500 hover:text-asphalt-900 rounded hover:bg-concrete-200"
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
            <span className="font-mono text-xs text-asphalt-500 uppercase shrink-0">SELECT DECK:</span>
            {areas.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAreaId(a.id)}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedAreaId === a.id
                    ? 'bg-signal-orange text-white'
                    : 'bg-white border border-concrete-300 text-asphalt-700 hover:bg-concrete-100'
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
          />
        </div>
      ) : (
        /* Queue View: List of all active parked vehicles */
        <div className="bg-white border border-concrete-300 rounded-lg shadow-tactile overflow-hidden">
          <div className="p-4 bg-concrete-50 border-b border-concrete-200 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-asphalt-900">
              Active Parked Vehicles ({activeAssignments.length})
            </h3>
            <span className="text-xs font-mono text-asphalt-500">
              Click 'Release' upon vehicle exit
            </span>
          </div>

          {activeAssignments.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-asphalt-500">
              No vehicles currently parked in facility.
            </div>
          ) : (
            <div className="divide-y divide-concrete-200">
              {activeAssignments.map((a) => (
                <div key={a.assignmentId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-concrete-50 transition">
                  <div className="flex items-center gap-4">
                    <LicensePlate plate={a.plateNumber} size="md" />
                    <div>
                      <div className="font-display font-bold text-base text-asphalt-900">
                        {a.spaceLabel}
                      </div>
                      <div className="text-xs font-mono text-asphalt-500">
                        {a.buildingName} · {a.areaName} ({a.levelCode})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-asphalt-500 hidden sm:block">
                      Parked at {new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewContact(a.assignmentId)}
                      className="px-3 py-1.5 bg-white border border-concrete-300 hover:bg-concrete-100 rounded text-asphalt-900 font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-signal-orange" />
                      <span>Contact</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReleaseAssignment(a.assignmentId)}
                      className="px-3 py-1.5 bg-asphalt-900 hover:bg-asphalt-800 text-white rounded font-bold transition btn-tactile cursor-pointer"
                    >
                      Release
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
