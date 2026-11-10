package com.parkpulse.parkingassignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingAssignmentRepository extends JpaRepository<ParkingAssignment, UUID> {

    @Query("SELECT a FROM ParkingAssignment a WHERE a.space.id = :spaceId AND a.status = 'ACTIVE'")
    Optional<ParkingAssignment> findActiveBySpaceId(@Param("spaceId") UUID spaceId);

    @Query("SELECT a FROM ParkingAssignment a WHERE a.plateNormalized = :plateNormalized AND a.status = 'ACTIVE'")
    Optional<ParkingAssignment> findActiveByPlateNormalized(@Param("plateNormalized") String plateNormalized);

    @Query("SELECT a FROM ParkingAssignment a " +
           "JOIN FETCH a.space s " +
           "JOIN FETCH s.parkingArea area " +
           "JOIN FETCH area.building b " +
           "WHERE a.employee.id = :employeeId AND a.status = 'ACTIVE'")
    Optional<ParkingAssignment> findActiveByEmployeeId(@Param("employeeId") UUID employeeId);

    List<ParkingAssignment> findByOrigin(AssignmentOrigin origin);

    List<ParkingAssignment> findByOriginAndStatus(AssignmentOrigin origin, AssignmentStatus status);

    @Query("SELECT a FROM ParkingAssignment a " +
           "JOIN FETCH a.space s " +
           "JOIN FETCH s.parkingArea area " +
           "JOIN FETCH area.building b " +
           "LEFT JOIN FETCH a.employee e " +
           "WHERE a.status = 'ACTIVE' ORDER BY a.assignedAt DESC")
    List<ParkingAssignment> findAllActiveWithDetails();

    @Query("SELECT a FROM ParkingAssignment a " +
           "JOIN FETCH a.space s " +
           "JOIN FETCH s.parkingArea area " +
           "JOIN FETCH area.building b " +
           "LEFT JOIN FETCH a.employee e " +
           "ORDER BY a.assignedAt DESC")
    List<ParkingAssignment> findRecentAssignments();

    long countByOriginAndStatus(AssignmentOrigin origin, AssignmentStatus status);

    long countByAssignedAtBetween(Instant start, Instant end);
}

