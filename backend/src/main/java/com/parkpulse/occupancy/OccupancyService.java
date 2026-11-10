package com.parkpulse.occupancy;

import com.parkpulse.building.Building;
import com.parkpulse.building.BuildingRepository;
import com.parkpulse.occupancy.dto.*;
import com.parkpulse.parkingarea.ParkingArea;
import com.parkpulse.parkingarea.ParkingAreaRepository;
import com.parkpulse.parkingassignment.ParkingAssignment;
import com.parkpulse.parkingassignment.ParkingAssignmentRepository;
import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.ParkingSpaceRepository;
import com.parkpulse.parkingspace.SpaceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class OccupancyService {

    private static final Logger log = LoggerFactory.getLogger(OccupancyService.class);

    private final BuildingRepository buildingRepository;
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSpaceRepository parkingSpaceRepository;
    private final ParkingAssignmentRepository parkingAssignmentRepository;
    private final OccupancyEventRepository occupancyEventRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${parkpulse.privacy.mask-peer-plates:true}")
    private boolean maskPeerPlates;

    public OccupancyService(
            BuildingRepository buildingRepository,
            ParkingAreaRepository parkingAreaRepository,
            ParkingSpaceRepository parkingSpaceRepository,
            ParkingAssignmentRepository parkingAssignmentRepository,
            OccupancyEventRepository occupancyEventRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.buildingRepository = buildingRepository;
        this.parkingAreaRepository = parkingAreaRepository;
        this.parkingSpaceRepository = parkingSpaceRepository;
        this.parkingAssignmentRepository = parkingAssignmentRepository;
        this.occupancyEventRepository = occupancyEventRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public AvailabilitySummaryDto getSystemAvailabilitySummary() {
        List<Building> buildings = buildingRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        long sysTotal = 0;
        long sysAvailable = 0;
        long sysOccupied = 0;
        long sysOos = 0;

        List<BuildingAvailabilityDto> buildingDtos = new ArrayList<>();

        for (Building building : buildings) {
            List<ParkingArea> areas = parkingAreaRepository.findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(building.getId());
            List<AreaAvailabilityDto> areaDtos = new ArrayList<>();

            long bldTotal = 0;
            long bldAvailable = 0;
            long bldOccupied = 0;
            long bldOos = 0;

            for (ParkingArea area : areas) {
                List<ParkingSpace> spaces = parkingSpaceRepository.findByParkingAreaIdAndIsActiveTrueOrderByDisplayOrderAsc(area.getId());

                long areaTotal = spaces.size();
                long areaAvailable = spaces.stream().filter(s -> s.getStatus() == SpaceStatus.AVAILABLE).count();
                long areaOccupied = spaces.stream().filter(s -> s.getStatus() == SpaceStatus.OCCUPIED).count();
                long areaOos = spaces.stream().filter(s -> s.getStatus() == SpaceStatus.OUT_OF_SERVICE).count();

                long usableCapacity = Math.max(0, areaTotal - areaOos);
                double areaPct = (usableCapacity > 0) ? ((double) areaAvailable / usableCapacity) * 100.0 : 0.0;

                areaDtos.add(new AreaAvailabilityDto(
                        area.getId(),
                        area.getName(),
                        area.getLevelCode(),
                        area.getDisplayOrder(),
                        areaTotal,
                        usableCapacity,
                        areaAvailable,
                        areaOccupied,
                        areaOos,
                        Math.round(areaPct * 10.0) / 10.0
                ));

                bldTotal += areaTotal;
                bldAvailable += areaAvailable;
                bldOccupied += areaOccupied;
                bldOos += areaOos;
            }

            long bldUsable = Math.max(0, bldTotal - bldOos);
            double bldPct = (bldUsable > 0) ? ((double) bldAvailable / bldUsable) * 100.0 : 0.0;

            buildingDtos.add(new BuildingAvailabilityDto(
                    building.getId(),
                    building.getName(),
                    building.getCode(),
                    building.getAddress(),
                    bldTotal,
                    bldUsable,
                    bldAvailable,
                    bldOccupied,
                    bldOos,
                    Math.round(bldPct * 10.0) / 10.0,
                    areaDtos
            ));

            sysTotal += bldTotal;
            sysAvailable += bldAvailable;
            sysOccupied += bldOccupied;
            sysOos += bldOos;
        }

        long sysUsable = Math.max(0, sysTotal - sysOos);
        double sysPct = (sysUsable > 0) ? ((double) sysAvailable / sysUsable) * 100.0 : 0.0;

        return new AvailabilitySummaryDto(
                sysTotal,
                sysUsable,
                sysAvailable,
                sysOccupied,
                sysOos,
                Math.round(sysPct * 10.0) / 10.0,
                buildingDtos,
                Instant.now()
        );
    }

    public List<FloorSpaceDto> getFloorSpaces(UUID areaId, UUID currentUserId, boolean isValetOrAdmin) {
        List<ParkingSpace> spaces = parkingSpaceRepository.findByParkingAreaIdAndIsActiveTrueOrderByDisplayOrderAsc(areaId);
        List<FloorSpaceDto> results = new ArrayList<>();

        for (ParkingSpace space : spaces) {
            boolean isOwnVehicle = false;
            String plate = null;
            UUID assignmentId = null;
            String employeeName = null;
            boolean isGuest = false;
            Instant assignedAt = null;

            if (space.getStatus() == SpaceStatus.OCCUPIED) {
                Optional<ParkingAssignment> activeOpt = parkingAssignmentRepository.findActiveBySpaceId(space.getId());
                if (activeOpt.isPresent()) {
                    ParkingAssignment a = activeOpt.get();
                    assignmentId = isValetOrAdmin ? a.getId() : null;
                    isGuest = a.isGuest();
                    assignedAt = a.getAssignedAt();

                    if (currentUserId != null && a.getEmployee() != null && a.getEmployee().getId().equals(currentUserId)) {
                        isOwnVehicle = true;
                    }

                    if (isValetOrAdmin) {
                        plate = a.getPlateRaw();
                        employeeName = (a.getEmployee() != null) ? a.getEmployee().getFullName() : (a.isGuest() ? "Guest Vehicle" : "Unknown");
                    } else if (isOwnVehicle) {
                        plate = a.getPlateRaw();
                    } else {
                        // Strict Privacy Policy: Mask peer number plates from other employees
                        plate = maskPeerPlates ? "[OCCUPIED]" : a.getPlateRaw();
                    }
                }
            }

            results.add(new FloorSpaceDto(
                    space.getId(),
                    areaId,
                    space.getSpaceLabel(),
                    space.getStatus(),
                    space.getDisplayOrder(),
                    isOwnVehicle,
                    plate,
                    assignmentId,
                    employeeName,
                    isGuest,
                    assignedAt
            ));
        }

        return results;
    }

    @Transactional
    public void recordOccupancyEvent(ParkingSpace space, ParkingAssignment assignment, SpaceStatus prev, SpaceStatus next, String origin) {
        OccupancyEvent event = new OccupancyEvent(space, assignment, prev.name(), next.name(), origin);
        occupancyEventRepository.save(event);
    }

    public void broadcastOccupancyUpdate(UUID spaceId, UUID buildingId, UUID areaId, SpaceStatus newStatus, Long version) {
        try {
            OccupancyUpdateBroadcast payload = new OccupancyUpdateBroadcast(
                    spaceId,
                    buildingId,
                    areaId,
                    newStatus,
                    version,
                    Instant.now()
            );
            // Public live topic: zero PII
            messagingTemplate.convertAndSend("/topic/occupancy", payload);
            messagingTemplate.convertAndSend("/topic/areas/" + areaId, payload);
            log.debug("Broadcasted live occupancy update for space {} to /topic/occupancy", spaceId);
        } catch (Exception ex) {
            log.error("Failed to broadcast WebSocket occupancy update: ", ex);
        }
    }
}

