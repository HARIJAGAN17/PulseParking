package com.parkpulse.parkingassignment;

import com.parkpulse.common.ApiResponse;
import com.parkpulse.parkingassignment.dto.ActiveParkingDto;
import com.parkpulse.parkingassignment.dto.ValetAssignRequest;
import com.parkpulse.parkingassignment.dto.ValetContactDto;
import com.parkpulse.security.UserPrincipal;
import com.parkpulse.user.UserService;
import com.parkpulse.user.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ParkingAssignmentController {

    private final ParkingAssignmentService assignmentService;
    private final UserService userService;

    public ParkingAssignmentController(ParkingAssignmentService assignmentService, UserService userService) {
        this.assignmentService = assignmentService;
        this.userService = userService;
    }

    @PostMapping("/valet/assignments")
    @PreAuthorize("hasAnyRole('VALET', 'ADMIN')")
    public ResponseEntity<ApiResponse<ActiveParkingDto>> assignVehicle(
            @Valid @RequestBody ValetAssignRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        ActiveParkingDto dto = assignmentService.assignVehicleAndGetDto(request, principal.getId(), ip, AssignmentOrigin.VALET);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Vehicle successfully assigned to space", dto));
    }

    @PostMapping("/valet/assignments/{id}/release")
    @PreAuthorize("hasAnyRole('VALET', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> releaseVehicle(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        assignmentService.releaseVehicle(id, principal.getId(), ip);
        return ResponseEntity.ok(ApiResponse.message("Vehicle departure processed. Space is now available."));
    }

    @GetMapping("/valet/assignments/active")
    @PreAuthorize("hasAnyRole('VALET', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ActiveParkingDto>>> getActiveAssignments() {
        List<ActiveParkingDto> list = assignmentService.listActiveAssignments().stream()
                .map(ActiveParkingDto::fromEntity)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/valet/assignments/{id}/contact")
    @PreAuthorize("hasAnyRole('VALET', 'ADMIN')")
    public ResponseEntity<ApiResponse<ValetContactDto>> getContactInfo(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        ValetContactDto contact = assignmentService.getValetAssignmentContact(id, principal.getId(), ip);
        return ResponseEntity.ok(ApiResponse.ok(contact));
    }

    @GetMapping("/valet/eligible-employees")
    @PreAuthorize("hasAnyRole('VALET', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getEligibleEmployees() {
        // Return approved employees with plates for valet search dropdown (phone numbers hidden)
        return ResponseEntity.ok(ApiResponse.ok(userService.listApprovedEmployeesWithPlates()));
    }

    @GetMapping("/employee/my-parking")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<ActiveParkingDto>> getMyParking(@AuthenticationPrincipal UserPrincipal principal) {
        return assignmentService.getEmployeeActiveParking(principal.getId())
                .map(p -> ResponseEntity.ok(ApiResponse.ok("Active parking found", p)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.ok("No active parking", null)));
    }
}

