package com.parkpulse.parkingarea;

import com.parkpulse.building.Building;
import com.parkpulse.building.BuildingService;
import com.parkpulse.common.ConflictException;
import com.parkpulse.common.ResourceNotFoundException;
import com.parkpulse.parkingarea.dto.ParkingAreaCreateRequest;
import com.parkpulse.parkingarea.dto.ParkingAreaDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ParkingAreaService {

    private final ParkingAreaRepository parkingAreaRepository;
    private final BuildingService buildingService;

    public ParkingAreaService(ParkingAreaRepository parkingAreaRepository, BuildingService buildingService) {
        this.parkingAreaRepository = parkingAreaRepository;
        this.buildingService = buildingService;
    }

    @Transactional(readOnly = true)
    public List<ParkingAreaDto> listActiveAreasForBuilding(UUID buildingId) {
        return parkingAreaRepository.findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(buildingId).stream()
                .map(ParkingAreaDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ParkingAreaDto> listAllAreasForBuilding(UUID buildingId) {
        return parkingAreaRepository.findByBuildingIdOrderByDisplayOrderAsc(buildingId).stream()
                .map(ParkingAreaDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ParkingArea findById(UUID id) {
        return parkingAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area not found with id: " + id));
    }

    public ParkingAreaDto createArea(UUID buildingId, ParkingAreaCreateRequest request) {
        Building building = buildingService.findById(buildingId);

        if (parkingAreaRepository.existsByBuildingIdAndLevelCodeIgnoreCase(buildingId, request.levelCode())) {
            throw new ConflictException("Level code '" + request.levelCode() + "' already exists in this building.");
        }

        ParkingArea area = new ParkingArea(
                building,
                request.name().trim(),
                request.levelCode().trim().toUpperCase(),
                request.displayOrder()
        );
        return ParkingAreaDto.fromEntity(parkingAreaRepository.save(area));
    }

    public ParkingAreaDto updateArea(UUID areaId, ParkingAreaCreateRequest request) {
        ParkingArea area = findById(areaId);

        if (!area.getLevelCode().equalsIgnoreCase(request.levelCode())
                && parkingAreaRepository.existsByBuildingIdAndLevelCodeIgnoreCase(area.getBuilding().getId(), request.levelCode())) {
            throw new ConflictException("Level code already in use on this floor: " + request.levelCode());
        }

        area.setName(request.name().trim());
        area.setLevelCode(request.levelCode().trim().toUpperCase());
        area.setDisplayOrder(request.displayOrder());

        return ParkingAreaDto.fromEntity(parkingAreaRepository.save(area));
    }

    public void setAreaActive(UUID areaId, boolean active) {
        ParkingArea area = findById(areaId);
        area.setActive(active);
        parkingAreaRepository.save(area);
    }
}

