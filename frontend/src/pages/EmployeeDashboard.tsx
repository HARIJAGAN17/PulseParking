import React, { useState, useEffect } from 'react';
import { ActiveParking, AvailabilitySummary, Building, FloorSpace, ParkingArea } from '../types';
import { api } from '../api/client';
import { FloorGrid } from '../components/FloorGrid';
import { LicensePlate } from '../components/LicensePlate';
import { CarAnimation } from '../components/CarAnimation';
import { MapPin, Clock, Building2, RefreshCw } from 'lucide-react';

interface EmployeeDashboardProps {
  summary: AvailabilitySummary | null;
  onRefreshSummary: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ summary, onRefreshSummary }) => {
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
      .catch(console.error);
  };

  useEffect(() => {
    fetchMyParking();
    api.buildings.getActive()
      .then((blds) => {
        setBuildings(blds);
        if (blds.length > 0) {
          setSelectedBuildingId(blds[0].id);
        }
      })
      .catch(console.error);
  }, []);

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
        <div className="bg-white border-2 border-asphalt-900 rounded-lg p-5 sm:p-6 shadow-tactile-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-orange animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-asphalt-900 bg-orange-100 px-2 py-0.5 rounded">
                VEHICLE CURRENTLY PARKED
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-asphalt-900">
                {activeParking.spaceLabel}
              </h2>
              <span className="text-asphalt-700 font-mono text-sm">
                ({activeParking.buildingName} · {activeParking.areaName})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-asphalt-700">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-signal-orange" />
                <span>Level: <strong>{activeParking.levelCode}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-asphalt-700" />
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
        /* Unparked State - Know Before You Go Banner */
        <div className="bg-white border border-concrete-300 rounded-lg p-5 sm:p-6 shadow-tactile">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold uppercase text-signal-emerald bg-emerald-50 px-2 py-0.5 rounded">
                  OFFICE COMMUTE READINESS
                </span>
              </div>
              <h2 className="font-display font-bold text-xl text-asphalt-900">
                Know Before You Go
              </h2>
              <p className="text-xs text-asphalt-700 mt-1 max-w-lg">
                Parking availability is monitored in real-time across all office facility decks. Your vehicle is currently not parked.
              </p>
            </div>

            {summary && (
              <div className="flex items-center gap-3 bg-concrete-100 p-3 rounded border border-concrete-200">
                <div className="text-center px-2">
                  <div className="font-display font-extrabold text-2xl text-signal-emerald">
                    {summary.availableSpaces}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-asphalt-700">Open Bays</div>
                </div>
                <div className="h-8 w-px bg-concrete-300" />
                <div className="text-center px-2">
                  <div className="font-display font-extrabold text-2xl text-asphalt-900">
                    {Math.round(100 - summary.availabilityPercentage)}%
                  </div>
                  <div className="text-[10px] font-mono uppercase text-asphalt-700">Occupied</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Facility & Floor Navigator Ribbon */}
      <div className="bg-white border border-concrete-300 rounded-lg p-4 shadow-tactile flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Building Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-asphalt-700 shrink-0" />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBuildingId(b.id)}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedBuildingId === b.id
                    ? 'bg-asphalt-900 text-white'
                    : 'bg-concrete-100 text-asphalt-700 hover:bg-concrete-200'
                }`}
              >
                {b.name} [{b.code}]
              </button>
            ))}
          </div>
        </div>

        {/* Floor Level Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {areas.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAreaId(a.id)}
              className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedAreaId === a.id
                  ? 'bg-signal-orange text-white'
                  : 'bg-concrete-100 text-asphalt-700 hover:bg-concrete-200'
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
            className="p-1.5 text-asphalt-700 hover:text-asphalt-950 rounded hover:bg-concrete-200 ml-2"
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
