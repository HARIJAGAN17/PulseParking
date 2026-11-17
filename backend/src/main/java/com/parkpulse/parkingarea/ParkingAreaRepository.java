package com.parkpulse.parkingarea;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParkingAreaRepository extends JpaRepository<ParkingArea, UUID> {
    List<ParkingArea> findByBuildingIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID buildingId);

    List<ParkingArea> findByBuildingIdOrderByDisplayOrderAsc(UUID buildingId);

    Optional<ParkingArea> findByBuildingIdAndLevelCodeIgnoreCase(UUID buildingId, String levelCode);

    boolean existsByBuildingIdAndLevelCodeIgnoreCase(UUID buildingId, String levelCode);

    boolean existsByBuildingId(UUID buildingId);

    boolean existsByBuildingIdAndIsActiveTrue(UUID buildingId);
}
