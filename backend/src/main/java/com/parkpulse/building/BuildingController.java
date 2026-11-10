package com.parkpulse.building;

import com.parkpulse.building.dto.BuildingCreateRequest;
import com.parkpulse.building.dto.BuildingDto;
import com.parkpulse.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @GetMapping("/buildings")
    public ResponseEntity<ApiResponse<List<BuildingDto>>> getActiveBuildings() {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.listActiveBuildings()));
    }

    @GetMapping("/admin/buildings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BuildingDto>>> getAllBuildings() {
        return ResponseEntity.ok(ApiResponse.ok(buildingService.listAllBuildings()));
    }

    @PostMapping("/admin/buildings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BuildingDto>> createBuilding(@Valid @RequestBody BuildingCreateRequest request) {
        BuildingDto building = buildingService.createBuilding(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Building created successfully", building));
    }

    @PutMapping("/admin/buildings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BuildingDto>> updateBuilding(
            @PathVariable UUID id,
            @Valid @RequestBody BuildingCreateRequest request
    ) {
        BuildingDto building = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Building updated successfully", building));
    }

    @PatchMapping("/admin/buildings/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleBuildingStatus(
            @PathVariable UUID id,
            @RequestParam boolean active
    ) {
        buildingService.setBuildingActive(id, active);
        return ResponseEntity.ok(ApiResponse.message("Building status updated"));
    }

    @DeleteMapping("/admin/buildings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBuilding(@PathVariable UUID id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.ok(ApiResponse.message("Building deleted successfully"));
    }
}

