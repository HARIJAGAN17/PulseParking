package com.parkpulse.parkingspace;

import com.parkpulse.audit.AuditService;
import com.parkpulse.common.BadRequestException;
import com.parkpulse.common.ConflictException;
import com.parkpulse.common.ResourceNotFoundException;
import com.parkpulse.occupancy.OccupancyService;
import com.parkpulse.parkingarea.ParkingArea;
import com.parkpulse.parkingarea.ParkingAreaService;
import com.parkpulse.parkingassignment.ParkingAssignmentRepository;
import com.parkpulse.parkingspace.dto.ParkingSpaceCreateRequest;
import com.parkpulse.user.User;
import com.parkpulse.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class ParkingSpaceService {

    private final ParkingSpaceRepository spaceRepository;
    private final ParkingAreaService areaService;
    private final ParkingAssignmentRepository assignmentRepository;
    private final OccupancyService occupancyService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public ParkingSpaceService(
            ParkingSpaceRepository spaceRepository,
            ParkingAreaService areaService,
            ParkingAssignmentRepository assignmentRepository,
            OccupancyService occupancyService,
            AuditService auditService,
            UserRepository userRepository
    ) {
        this.spaceRepository = spaceRepository;
        this.areaService = areaService;
        this.assignmentRepository = assignmentRepository;
        this.occupancyService = occupancyService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    public ParkingSpace findById(UUID id) {
        return spaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found with id: " + id));
    }

    public ParkingSpace createSpace(UUID areaId, ParkingSpaceCreateRequest request) {
        ParkingArea area = areaService.findById(areaId);

        if (spaceRepository.existsByParkingAreaIdAndSpaceLabelIgnoreCase(areaId, request.spaceLabel())) {
            throw new ConflictException("Space label '" + request.spaceLabel() + "' already exists on this floor.");
        }

        ParkingSpace space = new ParkingSpace(area, request.spaceLabel().trim(), request.displayOrder());
        return spaceRepository.save(space);
    }

    public ParkingSpace updateSpace(UUID spaceId, ParkingSpaceCreateRequest request) {
        ParkingSpace space = findById(spaceId);

        if (!space.getSpaceLabel().equalsIgnoreCase(request.spaceLabel())
                && spaceRepository.existsByParkingAreaIdAndSpaceLabelIgnoreCase(space.getParkingArea().getId(), request.spaceLabel())) {
            throw new ConflictException("Space label already in use on this floor: " + request.spaceLabel());
        }

        space.setSpaceLabel(request.spaceLabel().trim());
        space.setDisplayOrder(request.displayOrder());
        return spaceRepository.save(space);
    }

    public void updateSpaceStatus(UUID spaceId, SpaceStatus newStatus, UUID actorId, String ipAddress) {
        ParkingSpace space = findById(spaceId);

        if (space.getStatus() == newStatus) {
            return;
        }

        // Rule 8: Do not mark OUT_OF_SERVICE if space has an active vehicle
        if (newStatus == SpaceStatus.OUT_OF_SERVICE && space.getStatus() == SpaceStatus.OCCUPIED) {
            throw new BadRequestException("Cannot mark an occupied space out of service. Release the parked vehicle first.");
        }

        SpaceStatus prevStatus = space.getStatus();
        space.setStatus(newStatus);
        spaceRepository.save(space);

        // Record occupancy event
        occupancyService.recordOccupancyEvent(space, null, prevStatus, newStatus, "VALET");

        User actor = (actorId != null) ? userRepository.findById(actorId).orElse(null) : null;
        auditService.logAction(
                actor,
                "SPACE_STATUS_OVERRIDE",
                "PARKING_SPACE",
                spaceId.toString(),
                "Changed status from " + prevStatus + " to " + newStatus,
                ipAddress
        );

        // Broadcast live update
        occupancyService.broadcastOccupancyUpdate(
                space.getId(),
                space.getParkingArea().getBuilding().getId(),
                space.getParkingArea().getId(),
                newStatus,
                space.getVersion()
        );
    }

    public void deleteSpace(UUID spaceId) {
        ParkingSpace space = findById(spaceId);

        // Rule: Do not delete a space with an active assignment
        if (assignmentRepository.findActiveBySpaceId(spaceId).isPresent()) {
            throw new BadRequestException("Cannot delete space with an active vehicle assignment. Please release the vehicle first.");
        }

        // Soft delete / deactivate
        space.setActive(false);
        spaceRepository.save(space);
    }
}

