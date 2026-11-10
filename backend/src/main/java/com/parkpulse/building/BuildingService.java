package com.parkpulse.building;

import com.parkpulse.building.dto.BuildingCreateRequest;
import com.parkpulse.building.dto.BuildingDto;
import com.parkpulse.common.ConflictException;
import com.parkpulse.common.ResourceNotFoundException;
import com.parkpulse.parkingarea.ParkingAreaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final ParkingAreaRepository parkingAreaRepository;

    public BuildingService(BuildingRepository buildingRepository, ParkingAreaRepository parkingAreaRepository) {
        this.buildingRepository = buildingRepository;
        this.parkingAreaRepository = parkingAreaRepository;
    }

    @Transactional(readOnly = true)
    public List<BuildingDto> listActiveBuildings() {
        return buildingRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(BuildingDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BuildingDto> listAllBuildings() {
        return buildingRepository.findAll().stream()
                .map(BuildingDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Building findById(UUID id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
    }

    public BuildingDto createBuilding(BuildingCreateRequest request) {
        if (buildingRepository.existsByCodeIgnoreCase(request.code())) {
            throw new ConflictException("Building code already exists: " + request.code());
        }

        Building building = new Building(
                request.name().trim(),
                request.code().trim().toUpperCase(),
                request.address(),
                request.displayOrder()
        );
        return BuildingDto.fromEntity(buildingRepository.save(building));
    }

    public BuildingDto updateBuilding(UUID id, BuildingCreateRequest request) {
        Building building = findById(id);

        if (!building.getCode().equalsIgnoreCase(request.code()) && buildingRepository.existsByCodeIgnoreCase(request.code())) {
            throw new ConflictException("Building code already in use: " + request.code());
        }

        building.setName(request.name().trim());
        building.setCode(request.code().trim().toUpperCase());
        building.setAddress(request.address());
        building.setDisplayOrder(request.displayOrder());

        return BuildingDto.fromEntity(buildingRepository.save(building));
    }

    public void setBuildingActive(UUID id, boolean active) {
        Building building = findById(id);
        building.setActive(active);
        buildingRepository.save(building);
    }

    public void deleteBuilding(UUID id) {
        Building building = findById(id);
        if (parkingAreaRepository.existsByBuildingId(id)) {
            // When building has configured floors, soft-delete to preserve space records and audit logs
            building.setActive(false);
            buildingRepository.save(building);
        } else {
            buildingRepository.delete(building);
        }
    }
}

