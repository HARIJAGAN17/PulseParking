package com.parkpulse.parkingassignment;

import com.parkpulse.audit.AuditService;
import com.parkpulse.common.BadRequestException;
import com.parkpulse.common.ConflictException;
import com.parkpulse.occupancy.OccupancyService;
import com.parkpulse.parkingarea.ParkingArea;
import com.parkpulse.parkingassignment.dto.ValetAssignRequest;
import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.ParkingSpaceRepository;
import com.parkpulse.parkingspace.SpaceStatus;
import com.parkpulse.user.User;
import com.parkpulse.user.UserRepository;
import com.parkpulse.user.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParkingAssignmentServiceTest {

    @Mock
    private ParkingAssignmentRepository assignmentRepository;

    @Mock
    private ParkingSpaceRepository spaceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OccupancyService occupancyService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ParkingAssignmentService assignmentService;

    private ParkingSpace mockSpace;
    private User mockEmployee;
    private User mockValet;
    private UUID spaceId;
    private UUID employeeId;
    private UUID valetId;

    @BeforeEach
    void setUp() {
        spaceId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        valetId = UUID.randomUUID();

        ParkingArea mockArea = new ParkingArea();
        mockArea.setId(UUID.randomUUID());
        mockArea.setName("Ground Floor");
        mockArea.setLevelCode("GF");

        com.parkpulse.building.Building mockBuilding = new com.parkpulse.building.Building();
        mockBuilding.setId(UUID.randomUUID());
        mockBuilding.setName("Vismaya Building");
        mockBuilding.setCode("VSM-01");
        mockArea.setBuilding(mockBuilding);

        mockSpace = new ParkingSpace(mockArea, "GF-01", 1);
        mockSpace.setId(spaceId);
        mockSpace.setStatus(SpaceStatus.AVAILABLE);

        mockEmployee = new User(
                "sarah@acme.com", "hash", "Sarah Chen", "+919876500001", "KA01AB1234", "KA01AB1234", UserStatus.APPROVED
        );
        mockEmployee.setId(employeeId);

        mockValet = new User(
                "valet@acme.com", "hash", "Valet Operator", "+919876543210", null, null, UserStatus.APPROVED
        );
        mockValet.setId(valetId);
    }

    @Test
    @DisplayName("Should successfully assign available space to vehicle")
    void testAssignVehicleSuccess() {
        ValetAssignRequest req = new ValetAssignRequest(spaceId, employeeId, "KA 01-AB 1234", false, null);

        when(spaceRepository.findByIdWithOptimisticLock(spaceId)).thenReturn(Optional.of(mockSpace));
        when(assignmentRepository.findActiveBySpaceId(spaceId)).thenReturn(Optional.empty());
        when(assignmentRepository.findActiveByPlateNormalized("KA01AB1234")).thenReturn(Optional.empty());
        when(userRepository.findById(employeeId)).thenReturn(Optional.of(mockEmployee));
        when(assignmentRepository.findActiveByEmployeeId(employeeId)).thenReturn(Optional.empty());
        when(userRepository.findById(valetId)).thenReturn(Optional.of(mockValet));
        when(assignmentRepository.save(any(ParkingAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ParkingAssignment result = assignmentService.assignVehicle(req, valetId, "127.0.0.1", AssignmentOrigin.VALET);

        assertNotNull(result);
        assertEquals(SpaceStatus.OCCUPIED, mockSpace.getStatus());
        assertEquals("KA01AB1234", result.getPlateNormalized());
        verify(spaceRepository).save(mockSpace);
        verify(occupancyService).recordOccupancyEvent(eq(mockSpace), any(), eq(SpaceStatus.AVAILABLE), eq(SpaceStatus.OCCUPIED), eq("VALET"));
    }

    @Test
    @DisplayName("Should reject assignment if space is already occupied")
    void testAssignVehicleSpaceOccupied() {
        mockSpace.setStatus(SpaceStatus.OCCUPIED);
        ValetAssignRequest req = new ValetAssignRequest(spaceId, employeeId, "KA01AB1234", false, null);

        when(spaceRepository.findByIdWithOptimisticLock(spaceId)).thenReturn(Optional.of(mockSpace));

        assertThrows(ConflictException.class, () -> assignmentService.assignVehicle(req, valetId, "127.0.0.1", AssignmentOrigin.VALET));
    }

    @Test
    @DisplayName("Should reject assignment if vehicle plate already has an active assignment")
    void testAssignVehicleDuplicatePlate() {
        ValetAssignRequest req = new ValetAssignRequest(spaceId, employeeId, "KA01AB1234", false, null);

        when(spaceRepository.findByIdWithOptimisticLock(spaceId)).thenReturn(Optional.of(mockSpace));
        when(assignmentRepository.findActiveBySpaceId(spaceId)).thenReturn(Optional.empty());
        when(assignmentRepository.findActiveByPlateNormalized("KA01AB1234")).thenReturn(Optional.of(new ParkingAssignment()));

        assertThrows(ConflictException.class, () -> assignmentService.assignVehicle(req, valetId, "127.0.0.1", AssignmentOrigin.VALET));
    }

    @Test
    @DisplayName("Should release vehicle and mark space AVAILABLE")
    void testReleaseVehicleSuccess() {
        UUID assignmentId = UUID.randomUUID();
        mockSpace.setStatus(SpaceStatus.OCCUPIED);

        ParkingAssignment assignment = new ParkingAssignment(
                mockSpace, mockEmployee, mockValet, "KA01AB1234", "KA01AB1234", false, null, AssignmentOrigin.VALET
        );
        assignment.setId(assignmentId);

        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(userRepository.findById(valetId)).thenReturn(Optional.of(mockValet));

        assignmentService.releaseVehicle(assignmentId, valetId, "127.0.0.1");

        assertEquals(AssignmentStatus.COMPLETED, assignment.getStatus());
        assertNotNull(assignment.getReleasedAt());
        assertEquals(SpaceStatus.AVAILABLE, mockSpace.getStatus());
        verify(spaceRepository).save(mockSpace);
        verify(occupancyService).recordOccupancyEvent(eq(mockSpace), eq(assignment), eq(SpaceStatus.OCCUPIED), eq(SpaceStatus.AVAILABLE), eq("VALET"));
    }
}

