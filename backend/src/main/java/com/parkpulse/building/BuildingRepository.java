package com.parkpulse.building;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BuildingRepository extends JpaRepository<Building, UUID> {
    List<Building> findByIsActiveTrueOrderByDisplayOrderAsc();

    Optional<Building> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);
}
