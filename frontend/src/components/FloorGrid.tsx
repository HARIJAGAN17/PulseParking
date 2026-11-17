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
  selectedSpaceId?: string;
}

export const FloorGrid: React.FC<FloorGridProps> = ({
  spaces,
  isValetOrAdmin,
  onSelectSpace,
  onContactValet,
  selectedSpaceId,
}) => {
  if (spaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#E2E8F0] rounded-lg text-center shadow-tactile">
        <CarAnimation action="idle" size="sm" className="mb-4 opacity-40" />
        <h3 className="font-display font-semibold text-lg text-[#142D4E]">No Parking Bays Configured</h3>
        <p className="text-sm text-[#64748B] mt-1 max-w-sm">
          No parking spaces are currently active on this floor. Facility administrators can configure bays in the admin portal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white border border-[#E2E8F0] rounded-lg shadow-tactile parking-deck-grid">
      {/* Wayfinding Floor Header & Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#142D4E] uppercase tracking-wider bg-[#F1F5F9] px-2.5 py-1 rounded border border-[#E2E8F0]">
            BAY BLUEPRINT
          </span>
          <span className="text-xs text-[#64748B]">
            {spaces.length} Usable Deck Spaces
          </span>
        </div>

        {/* Status System Legend (Per Design System: Green, Red, Amber, Slate) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] sensor-glow-available" />
            <span className="text-[#334155] font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] sensor-glow-occupied" />
            <span className="text-[#334155] font-medium">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] sensor-glow-reserved" />
            <span className="text-[#334155] font-medium">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            <span className="text-[#334155] font-medium">Unavailable</span>
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
          const isSelected = selectedSpaceId === space.spaceId;

          return (
            <div
              key={space.spaceId}
              onClick={() => onSelectSpace && onSelectSpace(space)}
              className={`
                relative flex flex-col justify-between p-3.5 rounded-lg border transition-all select-none
                ${isAvailable ? 'bg-[#DCFCE7]/50 border-[#16A34A]/30 hover:border-[#16A34A] hover:bg-[#DCFCE7]/80' : ''}
                ${isOccupied ? 'bg-[#FEE2E2]/50 border-[#DC2626]/30 hover:border-[#DC2626]/60 hover:bg-[#FEE2E2]/70' : ''}
                ${isOos ? 'bg-[#E2E8F0]/60 border-slate-300 opacity-60 cursor-not-allowed' : ''}
                ${isSelected ? 'ring-2 ring-[#0D9488] ring-offset-2 border-[#0D9488]' : ''}
                ${isOwn ? 'ring-2 ring-[#0D9488] ring-offset-2 shadow-md' : ''}
                ${isValetOrAdmin && !isOos ? 'cursor-pointer hover:shadow-tactile' : ''}
              `}
            >
              {/* Top Sensor Bar & Bay Label */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#142D4E] tracking-tight">
                  {space.spaceLabel}
                </span>

                {/* Overhead Ultrasonic LED Sensor */}
                <div className="flex items-center gap-1.5">
                  {isAvailable && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] sensor-glow-available" title="Status: Available" />
                  )}
                  {isOccupied && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] sensor-glow-occupied" title="Status: Occupied" />
                  )}
                  {isOos && (
                    <span title="Status: Unavailable / Maintenance">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#64748B]" />
                    </span>
                  )}
                </div>
              </div>

              {/* Bay Boundary & Center Content */}
              <div className="my-2 border-l-2 border-r-2 border-dashed border-[#CBD5E1] min-h-[96px] py-1.5 flex flex-col items-center justify-center">
                {isAvailable && (
                  <div className="flex flex-col items-center justify-center py-3 text-center">
                    <span className="font-mono text-[10px] text-[#166534] font-bold tracking-wider uppercase bg-[#DCFCE7] px-2 py-0.5 rounded border border-[#16A34A]/30">
                      AVAILABLE
                    </span>
                    <span className="text-[10px] text-[#166534] font-sans mt-1">
                      Ready for assignment
                    </span>
                    {isValetOrAdmin && (
                      <span className="text-[10px] text-[#0D9488] font-mono mt-1 font-semibold flex items-center gap-0.5">
                        + Assign
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
                      <div className="mt-0.5 flex items-center gap-1 px-1.5 py-0.5 bg-[#0D9488] text-white text-[9px] font-mono font-bold uppercase rounded">
                        <Sparkles className="w-2.5 h-2.5" />
                        YOUR VEHICLE
                      </div>
                    )}

                    {isValetOrAdmin && space.employeeName && (
                      <span className="text-[10px] text-[#334155] truncate max-w-[110px] text-center" title={space.employeeName}>
                        {space.employeeName}
                      </span>
                    )}
                  </div>
                )}

                {isOos && (
                  <div className="flex flex-col items-center justify-center text-center px-1 py-3">
                    <span className="font-mono text-[10px] text-[#334155] uppercase font-bold tracking-tight bg-[#E2E8F0] px-2 py-0.5 rounded border border-slate-300">
                      UNAVAILABLE
                    </span>
                    <span className="text-[10px] text-[#64748B] mt-1">
                      Maintenance / blocked
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Status / Action Ribbon */}
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-mono">
                <span className={`font-semibold ${isAvailable ? 'text-[#166534]' : isOccupied ? 'text-[#991B1B]' : 'text-[#334155]'}`}>
                  {isAvailable ? 'AVAILABLE' : isOccupied ? 'OCCUPIED' : 'BLOCKED'}
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
                    className="text-[#334155] hover:text-[#142D4E] p-1 hover:bg-[#F1F5F9] rounded cursor-pointer"
                    title="View Driver Contact Phone Number"
                  >
                    <Phone className="w-3 h-3 text-[#0D9488]" />
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
