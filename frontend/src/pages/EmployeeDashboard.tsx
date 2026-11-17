import React, { useState, useEffect } from 'react';
import { ActiveParking, AvailabilitySummary, Building, FloorSpace, ParkingArea, User } from '../types';
import { api } from '../api/client';
import { FloorGrid } from '../components/FloorGrid';
import { LicensePlate } from '../components/LicensePlate';
import { CarAnimation } from '../components/CarAnimation';
import { MapPin, Clock, Building2, RefreshCw } from 'lucide-react';

interface EmployeeDashboardProps {
  summary: AvailabilitySummary | null;
  onRefreshSummary: () => void;
  currentUser?: User | null;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ summary, onRefreshSummary, currentUser }) => {
  const [activeParking, setActiveParking] = useState<ActiveParking | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [spaces, setSpaces] = useState<FloorSpace[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch user's current parking location
  const fetchMyParking = () => {
    api.employee.getMyParking()
      .then(setActiveParking)
      .catch((err) => {
        console.error(err);
        setActiveParking(null);
      });
  };

  useEffect(() => {
    fetchMyParking();
    api.buildings.getActive()
      .then((blds) => {
        setBuildings(blds);
        if (blds.length > 0) {
          setSelectedBuildingId((prev) => prev || blds[0].id);
        }
      })
      .catch(console.error);
  }, [currentUser?.id]);

  // 2. Fetch areas when building changes
  useEffect(() => {
    if (selectedBuildingId) {
      api.areas.getActive(selectedBuildingId)
        .then((floorAreas) => {
          setAreas(floorAreas);
          if (floorAreas.length > 0) {
            setSelectedAreaId(floorAreas[0].id);
          }
        })
        .catch(console.error);
    }
  }, [selectedBuildingId]);

  // 3. Fetch spaces when area changes
  const fetchSpaces = () => {
    if (selectedAreaId) {
      setLoading(true);
      api.occupancy.getFloorSpaces(selectedAreaId)
        .then((sp) => {
          setSpaces(sp);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [selectedAreaId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Employee Active Parking Hero Card (if vehicle is parked) */}
      {activeParking ? (
        <div className="bg-white border border-[#E2E8F0] border-l-4 border-l-[#0D9488] rounded-lg p-5 sm:p-6 shadow-tactile flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                VEHICLE CURRENTLY PARKED
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#142D4E]">
                {activeParking.spaceLabel}
              </h2>
              <span className="text-[#475569] font-mono text-sm">
                ({activeParking.buildingName} · {activeParking.areaName})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#334155]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0D9488]" />
                <span>Level: <strong className="text-[#142D4E]">{activeParking.levelCode}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <span>Parked at: {new Date(activeParking.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 z-10 self-start md:self-auto">
            <LicensePlate plate={activeParking.plateNumber} size="lg" />
            <CarAnimation action="idle" size="md" className="hidden sm:inline-block" />
          </div>
        </div>
      ) : (
        /* Unparked State - Know Before You Go Overview Banner */
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6 shadow-tactile">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold uppercase text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#16A34A]/30">
                  OFFICE COMMUTE READINESS
                </span>
              </div>
              <h2 className="font-display font-bold text-xl text-[#142D4E]">
                Know Before You Go
              </h2>
              <p className="text-xs text-[#64748B] mt-1 max-w-lg">
                Parking availability is monitored in real-time across all office facility decks. Your vehicle is currently not parked.
              </p>
            </div>

            {summary && (
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                {/* Available Spaces Metric */}
                <div className="text-center px-3">
                  <div className="font-display font-extrabold text-2xl text-[#16A34A]">
                    {summary.availableSpaces}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-[#334155] font-semibold">Available</div>
                </div>
                <div className="h-8 w-px bg-[#E2E8F0]" />
                {/* Occupied Spaces Metric */}
                <div className="text-center px-3">
                  <div className="font-display font-extrabold text-2xl text-[#DC2626]">
                    {summary.occupiedSpaces}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-[#334155] font-semibold">Occupied</div>
                </div>
                <div className="h-8 w-px bg-[#E2E8F0]" />
                {/* Total Capacity Metric */}
                <div className="text-center px-3">
                  <div className="font-display font-extrabold text-2xl text-[#142D4E]">
                    {summary.usableCapacity}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-[#64748B]">Capacity</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Facility & Floor Navigator Ribbon */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-tactile flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Building Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#142D4E] shrink-0" />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedBuildingId === b.id
                    ? 'bg-[#142D4E] text-white shadow-sm'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                }`}
              >
                {b.name} [{b.code}]
              </button>
            ))}
          </div>
        </div>

        {/* Floor Level Tabs (Selected Floor = Teal #0D9488) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAreaId(a.id)}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedAreaId === a.id
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
              }`}
            >
              {a.name} ({a.levelCode})
            </button>
          ))}

          <button
            onClick={() => {
              fetchSpaces();
              onRefreshSummary();
            }}
            className="p-1.5 text-[#64748B] hover:text-[#142D4E] rounded hover:bg-[#F1F5F9] ml-2 cursor-pointer transition"
            title="Refresh Floor Layout"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Interactive Floor Blueprint Grid */}
      <FloorGrid
        spaces={spaces}
        isValetOrAdmin={false}
      />
    </div>
  );
};
