package com.parkpulse.occupancy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OccupancyEventRepository extends JpaRepository<OccupancyEvent, UUID> {

    List<OccupancyEvent> findByOrigin(String origin);

    void deleteByOrigin(String origin);

    @Query("SELECT e FROM OccupancyEvent e WHERE e.recordedAt >= :start AND e.recordedAt <= :end AND e.origin = :origin ORDER BY e.recordedAt ASC")
    List<OccupancyEvent> findEventsBetween(
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("origin") String origin
    );

    @Query("SELECT e FROM OccupancyEvent e WHERE e.recordedAt >= :start AND e.recordedAt <= :end ORDER BY e.recordedAt ASC")
    List<OccupancyEvent> findAllEventsBetween(
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT e FROM OccupancyEvent e WHERE e.space.id = :spaceId ORDER BY e.recordedAt DESC")
    List<OccupancyEvent> findRecentForSpace(@Param("spaceId") UUID spaceId);
}

