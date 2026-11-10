package com.parkpulse.parkingarea;

import com.parkpulse.common.ApiResponse;
import com.parkpulse.parkingarea.dto.ParkingAreaCreateRequest;
import com.parkpulse.parkingarea.dto.ParkingAreaDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ParkingAreaController {

    private final ParkingAreaService parkingAreaService;

    public ParkingAreaController(ParkingAreaService parkingAreaService) {
        this.parkingAreaService = parkingAreaService;
    }

    @GetMapping("/buildings/{buildingId}/areas")
    public ResponseEntity<ApiResponse<List<ParkingAreaDto>>> getActiveAreas(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.ok(parkingAreaService.listActiveAreasForBuilding(buildingId)));
    }

    @GetMapping("/admin/buildings/{buildingId}/areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ParkingAreaDto>>> getAllAreas(@PathVariable UUID buildingId) {
        return ResponseEntity.ok(ApiResponse.ok(parkingAreaService.listAllAreasForBuilding(buildingId)));
    }

    @PostMapping("/admin/buildings/{buildingId}/areas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingAreaDto>> createArea(
            @PathVariable UUID buildingId,
            @Valid @RequestBody ParkingAreaCreateRequest request
    ) {
        ParkingAreaDto area = parkingAreaService.createArea(buildingId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Parking area created successfully", area));
    }

    @PutMapping("/admin/areas/{areaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ParkingAreaDto>> updateArea(
            @PathVariable UUID areaId,
            @Valid @RequestBody ParkingAreaCreateRequest request
    ) {
        ParkingAreaDto area = parkingAreaService.updateArea(areaId, request);
        return ResponseEntity.ok(ApiResponse.ok("Parking area updated successfully", area));
    }

    @PatchMapping("/admin/areas/{areaId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleAreaStatus(
            @PathVariable UUID areaId,
            @RequestParam boolean active
    ) {
        parkingAreaService.setAreaActive(areaId, active);
        return ResponseEntity.ok(ApiResponse.message("Parking area status updated"));
    }
}

