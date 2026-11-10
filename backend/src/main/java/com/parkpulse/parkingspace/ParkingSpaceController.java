package com.parkpulse.parkingspace;

import com.parkpulse.common.ApiResponse;
import com.parkpulse.parkingspace.dto.ParkingSpaceCreateRequest;
import com.parkpulse.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ParkingSpaceController {

    private final ParkingSpaceService spaceService;

    public ParkingSpaceController(ParkingSpaceService spaceService) {
        this.spaceService = spaceService;
    }

    @PostMapping("/admin/areas/{areaId}/spaces")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingSpace>> createSpace(
            @PathVariable UUID areaId,
            @Valid @RequestBody ParkingSpaceCreateRequest request
    ) {
        ParkingSpace space = spaceService.createSpace(areaId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Parking space created successfully", space));
    }

    @PutMapping("/admin/spaces/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingSpace>> updateSpace(
            @PathVariable UUID id,
            @Valid @RequestBody ParkingSpaceCreateRequest request
    ) {
        ParkingSpace space = spaceService.updateSpace(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Parking space updated successfully", space));
    }

    @PatchMapping("/admin/spaces/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'VALET')")
    public ResponseEntity<ApiResponse<Void>> updateSpaceStatus(
            @PathVariable UUID id,
            @RequestParam SpaceStatus status,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest
    ) {
        String ip = httpRequest.getRemoteAddr();
        spaceService.updateSpaceStatus(id, status, principal.getId(), ip);
        return ResponseEntity.ok(ApiResponse.message("Space status updated to " + status));
    }

    @DeleteMapping("/admin/spaces/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSpace(@PathVariable UUID id) {
        spaceService.deleteSpace(id);
        return ResponseEntity.ok(ApiResponse.message("Space deactivated successfully"));
    }
}

