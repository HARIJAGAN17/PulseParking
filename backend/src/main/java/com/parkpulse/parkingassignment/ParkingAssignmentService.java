package com.parkpulse.parkingassignment;

import com.parkpulse.audit.AuditService;
import com.parkpulse.common.BadRequestException;
import com.parkpulse.common.ConflictException;
import com.parkpulse.common.PlateNormalizer;
import com.parkpulse.common.ResourceNotFoundException;
import com.parkpulse.occupancy.OccupancyService;
import com.parkpulse.parkingassignment.dto.ActiveParkingDto;
import com.parkpulse.parkingassignment.dto.ValetAssignRequest;
import com.parkpulse.parkingassignment.dto.ValetContactDto;
import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.ParkingSpaceRepository;
import com.parkpulse.parkingspace.SpaceStatus;
import com.parkpulse.user.User;
import com.parkpulse.user.UserRepository;
import com.parkpulse.user.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ParkingAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(ParkingAssignmentService.class);

    private final ParkingAssignmentRepository assignmentRepository;
    private final ParkingSpaceRepository spaceRepository;
    private final UserRepository userRepository;
    private final OccupancyService occupancyService;
    private final AuditService auditService;

    public ParkingAssignmentService(
            ParkingAssignmentRepository assignmentRepository,
            ParkingSpaceRepository spaceRepository,
            UserRepository userRepository,
            OccupancyService occupancyService,
            AuditService auditService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.spaceRepository = spaceRepository;
        this.userRepository = userRepository;
        this.occupancyService = occupancyService;
        this.auditService = auditService;
    }

    public ParkingAssignment assignVehicle(ValetAssignRequest request, UUID valetId, String ipAddress, AssignmentOrigin origin) {
        String normalizedPlate = PlateNormalizer.normalize(request.plateNumber());
        if (normalizedPlate.isBlank()) {
            throw new BadRequestException("Invalid vehicle registration plate number.");
        }

        // 1. Concurrency Check: Space must be AVAILABLE and active
        ParkingSpace space = spaceRepository.findByIdWithOptimisticLock(request.spaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking space not found with id: " + request.spaceId()));

        if (!space.isActive()) {
            throw new BadRequestException("Parking space is currently inactive.");
        }
        if (space.getStatus() == SpaceStatus.OCCUPIED) {
            throw new ConflictException("Space '" + space.getSpaceLabel() + "' is already occupied.");
        }
        if (space.getStatus() == SpaceStatus.OUT_OF_SERVICE) {
            throw new BadRequestException("Space '" + space.getSpaceLabel() + "' is currently out of service.");
        }

        // 2. Concurrency Check: Ensure no active assignment on this space
        if (assignmentRepository.findActiveBySpaceId(space.getId()).isPresent()) {
            throw new ConflictException("Space '" + space.getSpaceLabel() + "' has an active assignment.");
        }

        // 3. Concurrency Check: Ensure no active assignment on this vehicle plate
        if (assignmentRepository.findActiveByPlateNormalized(normalizedPlate).isPresent()) {
            throw new ConflictException("Vehicle with plate '" + request.plateNumber() + "' is already parked in an active space.");
        }

        // 4. Resolve Employee
        User employee = null;
        if (!request.isGuest()) {
            if (request.employeeId() != null) {
                employee = userRepository.findById(request.employeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + request.employeeId()));
            } else {
                employee = userRepository.findByPlateNormalized(normalizedPlate).orElse(null);
            }

            if (employee != null) {
                if (employee.getStatus() != UserStatus.APPROVED) {
                    throw new BadRequestException("Employee account is not approved.");
                }
                if (assignmentRepository.findActiveByEmployeeId(employee.getId()).isPresent()) {
                    throw new ConflictException("Employee '" + employee.getFullName() + "' already has an active vehicle parked.");
                }
            }
        }

        // 5. Resolve Valet Operator
        User valet = (valetId != null) ? userRepository.findById(valetId).orElse(null) : null;

        // 6. Transition Space & Save Assignment
        SpaceStatus previousStatus = space.getStatus();
        space.setStatus(SpaceStatus.OCCUPIED);
        spaceRepository.save(space);

        ParkingAssignment assignment = new ParkingAssignment(
                space,
                employee,
                valet,
                request.plateNumber().trim().toUpperCase(),
                normalizedPlate,
                request.isGuest() || employee == null,
                request.guestNote(),
                origin != null ? origin : AssignmentOrigin.VALET
        );
        ParkingAssignment savedAssignment = assignmentRepository.save(assignment);

        // 7. Record Occupancy Event
        occupancyService.recordOccupancyEvent(
                space,
                savedAssignment,
                previousStatus,
                SpaceStatus.OCCUPIED,
                savedAssignment.getOrigin().name()
        );

        // 8. Audit Log
        auditService.logAction(
                valet,
                "VEHICLE_ASSIGNED",
                "PARKING_SPACE",
                space.getId().toString(),
                "Assigned plate " + normalizedPlate + " to " + space.getSpaceLabel(),
                ipAddress
        );

        // 9. Broadcast live update
        occupancyService.broadcastOccupancyUpdate(
                space.getId(),
                space.getParkingArea().getBuilding().getId(),
                space.getParkingArea().getId(),
                SpaceStatus.OCCUPIED,
                space.getVersion()
        );

        // Pre-initialize lazy proxies while session is active
        if (space.getParkingArea() != null) {
            space.getParkingArea().getName();
            if (space.getParkingArea().getBuilding() != null) {
                space.getParkingArea().getBuilding().getName();
            }
        }

        log.info("Assigned space {} to vehicle plate {} by valet {}", space.getSpaceLabel(), normalizedPlate, valetId);
        return savedAssignment;
    }

    public ActiveParkingDto assignVehicleAndGetDto(ValetAssignRequest request, UUID valetId, String ipAddress, AssignmentOrigin origin) {
        ParkingAssignment assignment = assignVehicle(request, valetId, ipAddress, origin);
        return ActiveParkingDto.fromEntity(assignment);
    }

    public void releaseVehicle(UUID assignmentId, UUID valetId, String ipAddress) {
        ParkingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking assignment not found with id: " + assignmentId));

        if (assignment.getStatus() != AssignmentStatus.ACTIVE) {
            throw new BadRequestException("This parking assignment is already closed.");
        }

        ParkingSpace space = assignment.getSpace();
        SpaceStatus previousStatus = space.getStatus();

        // 1. Close assignment
        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignment.setReleasedAt(Instant.now());
        assignmentRepository.save(assignment);

        // 2. Mark space AVAILABLE
        space.setStatus(SpaceStatus.AVAILABLE);
        spaceRepository.save(space);

        // 3. Record Occupancy Event
        occupancyService.recordOccupancyEvent(
                space,
                assignment,
                previousStatus,
                SpaceStatus.AVAILABLE,
                assignment.getOrigin().name()
        );

        User valet = (valetId != null) ? userRepository.findById(valetId).orElse(null) : null;

        // 4. Audit Log
        auditService.logAction(
                valet,
                "VEHICLE_RELEASED",
                "PARKING_SPACE",
                space.getId().toString(),
                "Released space " + space.getSpaceLabel() + " for plate " + assignment.getPlateNormalized(),
                ipAddress
        );

        // 5. Broadcast live update
        occupancyService.broadcastOccupancyUpdate(
                space.getId(),
                space.getParkingArea().getBuilding().getId(),
                space.getParkingArea().getId(),
                SpaceStatus.AVAILABLE,
                space.getVersion()
        );

        log.info("Released space {} previously occupied by vehicle plate {}", space.getSpaceLabel(), assignment.getPlateNormalized());
    }

    @Transactional(readOnly = true)
    public Optional<ActiveParkingDto> getEmployeeActiveParking(UUID employeeId) {
        return assignmentRepository.findActiveByEmployeeId(employeeId)
                .map(ActiveParkingDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<ParkingAssignment> listActiveAssignments() {
        return assignmentRepository.findAllActiveWithDetails();
    }

    @Transactional(readOnly = true)
    public List<ParkingAssignment> listRecentAssignments() {
        return assignmentRepository.findRecentAssignments();
    }

    public ValetContactDto getValetAssignmentContact(UUID assignmentId, UUID actorId, String ipAddress) {
        ParkingAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        User actor = (actorId != null) ? userRepository.findById(actorId).orElse(null) : null;

        // Log sensitive phone number view for audit compliance (Section 1.3)
        auditService.logAction(
                actor,
                "PHONE_NUMBER_VIEWED",
                "PARKING_ASSIGNMENT",
                assignmentId.toString(),
                "Valet or Admin viewed contact info for operational assignment",
                ipAddress
        );

        User emp = assignment.getEmployee();
        String name = emp != null ? emp.getFullName() : (assignment.isGuest() ? "Guest / Unregistered" : "Unknown");
        String phone = emp != null ? emp.getPhoneNumber() : "No phone number available";
        String email = emp != null ? emp.getEmail() : "N/A";

        return new ValetContactDto(
                assignment.getId(),
                name,
                phone,
                email,
                assignment.getPlateRaw(),
                assignment.getSpace().getSpaceLabel(),
                assignment.getAssignedAt()
        );
    }
}

