package com.parkpulse.parkingspace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingSpaceRepository extends JpaRepository<ParkingSpace, UUID> {

    List<ParkingSpace> findByParkingAreaIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID parkingAreaId);

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT s FROM ParkingSpace s WHERE s.id = :id")
    Optional<ParkingSpace> findByIdWithOptimisticLock(@Param("id") UUID id);

    boolean existsByParkingAreaIdAndSpaceLabelIgnoreCase(UUID parkingAreaId, String spaceLabel);

    long countByParkingAreaIdAndStatusAndIsActiveTrue(UUID parkingAreaId, SpaceStatus status);

    long countByParkingAreaIdAndIsActiveTrue(UUID parkingAreaId);
}

