import React from 'react';
import { FloorSpace } from '../types';
import { LicensePlate } from './LicensePlate';
import { CarAnimation } from './CarAnimation';
import { AlertTriangle, Phone, Sparkles } from 'lucide-react';

interface FloorGridProps {
  spaces: FloorSpace[];
  isValetOrAdmin: boolean;
  onSelectSpace?: (space: FloorSpace) => void;
  onContactValet?: (assignmentId: string) => void;
}

export const FloorGrid: React.FC<FloorGridProps> = ({
  spaces,
  isValetOrAdmin,
  onSelectSpace,
  onContactValet,
}) => {
  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-concrete-300 rounded-lg text-center">
        <CarAnimation action="idle" size="sm" className="mb-4 opacity-40" />
        <h3 className="font-display font-semibold text-lg text-asphalt-900">No Parking Bays Configured</h3>
        <p className="text-sm text-asphalt-700 mt-1 max-w-sm">
          No parking spaces are currently active on this floor. Facility administrators can configure bays in the admin portal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white border border-concrete-300 rounded-lg shadow-tactile parking-deck-grid">
      {/* Wayfinding Floor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-concrete-200">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-asphalt-700 uppercase tracking-widest bg-concrete-200 px-2.5 py-1 rounded">
            BAY BLUEPRINT
          </span>
          <span className="text-xs text-asphalt-700">
            {spaces.length} Usable Deck Spaces
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-emerald sensor-glow-available" />
            <span className="text-asphalt-700">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal-amber sensor-glow-occupied" />
            <span className="text-asphalt-700">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-asphalt-700">Out of Service</span>
          </div>
        </div>
      </div>

      {/* Blueprint Bay Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {spaces.map((space) => {
          const isAvailable = space.status === 'AVAILABLE';
          const isOccupied = space.status === 'OCCUPIED';
          const isOos = space.status === 'OUT_OF_SERVICE';
          const isOwn = space.isOwnVehicle;

          return (
            <div
              key={space.spaceId}
              onClick={() => onSelectSpace && onSelectSpace(space)}
              className={`
                relative flex flex-col justify-between p-3.5 rounded border transition-all select-none
                ${isAvailable ? 'bg-concrete-50 border-emerald-300/80 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer' : ''}
                ${isOccupied ? 'bg-white border-amber-300/80' : ''}
                ${isOos ? 'bg-concrete-200/60 border-slate-300 opacity-60 cursor-not-allowed' : ''}
                ${isOwn ? 'ring-2 ring-signal-orange ring-offset-2 border-signal-orange bg-orange-50/20' : ''}
                ${isValetOrAdmin ? 'cursor-pointer hover:shadow-tactile' : ''}
              `}
            >
              {/* Top Sensor Bar & Bay Label */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-asphalt-900 tracking-tight">
                  {space.spaceLabel}
                </span>

                {/* Overhead Ultrasonic LED Sensor */}
                <div className="flex items-center gap-1.5">
                  {isAvailable && (
                    <span className="w-2.5 h-2.5 rounded-full bg-signal-emerald sensor-glow-available" title="Sensor: Vacant" />
                  )}
                  {isOccupied && (
                    <span className="w-2.5 h-2.5 rounded-full bg-signal-amber sensor-glow-occupied" title="Sensor: Occupied" />
                  )}
                  {isOos && (
                    <span title="Bay Out of Service">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  )}
                </div>
              </div>

              {/* Bay Painted Boundary Lines Visual */}
              <div className="my-2 border-l-2 border-r-2 border-dashed border-concrete-300 min-h-[96px] py-1.5 flex flex-col items-center justify-center">
                {isAvailable && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <span className="font-mono text-[10px] text-emerald-800 font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      VACANT
                    </span>
                    {isValetOrAdmin && (
                      <span className="text-[10px] text-asphalt-500 font-mono mt-2 flex items-center gap-1">
                        + Tap to Park
                      </span>
                    )}
                  </div>
                )}

                {isOccupied && (
                  <div className="flex flex-col items-center w-full px-1 space-y-1">
                    <CarAnimation
                      action="idle"
                      size="xs"
                      isOwn={isOwn}
                      className="transition-transform duration-200 hover:scale-105"
                    />

                    <LicensePlate
                      plate={space.plateNumber}
                      isMasked={!isValetOrAdmin && !isOwn}
                      size="sm"
                    />

                    {isOwn && (
                      <div className="mt-0.5 flex items-center gap-1 px-1.5 py-0.5 bg-signal-orange text-white text-[9px] font-mono font-bold uppercase rounded">
                        <Sparkles className="w-2.5 h-2.5" />
                        YOUR VEHICLE
                      </div>
                    )}

                    {isValetOrAdmin && space.employeeName && (
                      <span className="text-[10px] text-asphalt-600 truncate max-w-[110px] text-center" title={space.employeeName}>
                        {space.employeeName}
                      </span>
                    )}
                  </div>
                )}

                {isOos && (
                  <div className="flex flex-col items-center justify-center text-center px-1 py-4">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-tight bg-concrete-200 px-2 py-0.5 rounded">
                      MAINTENANCE
                    </span>
                  </div>
                )}
              </div>

              {/* Footer status / Action ribbon */}
              <div className="pt-2 border-t border-concrete-200/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-asphalt-700">
                  {isAvailable ? 'READY' : isOccupied ? 'IN USE' : 'CLOSED'}
                </span>

                {isValetOrAdmin && isOccupied && space.assignmentId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onContactValet && space.assignmentId) {
                        onContactValet(space.assignmentId);
                      }
                    }}
                    className="text-asphalt-700 hover:text-asphalt-950 p-1 hover:bg-concrete-200 rounded"
                    title="View Contact Phone Number"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
