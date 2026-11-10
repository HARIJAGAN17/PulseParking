package com.parkpulse.occupancy;

import com.parkpulse.common.ApiResponse;
import com.parkpulse.occupancy.dto.AvailabilitySummaryDto;
import com.parkpulse.occupancy.dto.FloorSpaceDto;
import com.parkpulse.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/occupancy")
public class OccupancyController {

    private final OccupancyService occupancyService;

    public OccupancyController(OccupancyService occupancyService) {
        this.occupancyService = occupancyService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AvailabilitySummaryDto>> getAvailabilitySummary() {
        return ResponseEntity.ok(ApiResponse.ok(occupancyService.getSystemAvailabilitySummary()));
    }

    @GetMapping("/areas/{areaId}/spaces")
    public ResponseEntity<ApiResponse<List<FloorSpaceDto>>> getFloorSpaces(
            @PathVariable UUID areaId,
            Authentication authentication
    ) {
        UUID currentUserId = null;
        boolean isValetOrAdmin = false;

        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserPrincipal principal) {
            currentUserId = principal.getId();
            isValetOrAdmin = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_VALET") || a.getAuthority().equals("ROLE_ADMIN"));
        }

        List<FloorSpaceDto> spaces = occupancyService.getFloorSpaces(areaId, currentUserId, isValetOrAdmin);
        return ResponseEntity.ok(ApiResponse.ok(spaces));
    }
}

