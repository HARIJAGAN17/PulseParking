package com.parkpulse.parkingassignment.dto;

import com.parkpulse.parkingassignment.ParkingAssignment;

import java.time.Instant;
import java.util.UUID;

public record ActiveParkingDto(
    UUID assignmentId,
    UUID spaceId,
    String spaceLabel,
    UUID areaId,
    String areaName,
    String levelCode,
    UUID buildingId,
    String buildingName,
    String buildingCode,
    String plateNumber,
    Instant assignedAt
) {
    public static ActiveParkingDto fromEntity(ParkingAssignment a) {
        return new ActiveParkingDto(
            a.getId(),
            a.getSpace().getId(),
            a.getSpace().getSpaceLabel(),
            a.getSpace().getParkingArea().getId(),
            a.getSpace().getParkingArea().getName(),
            a.getSpace().getParkingArea().getLevelCode(),
            a.getSpace().getParkingArea().getBuilding().getId(),
            a.getSpace().getParkingArea().getBuilding().getName(),
            a.getSpace().getParkingArea().getBuilding().getCode(),
            a.getPlateRaw(),
            a.getAssignedAt()
        );
    }
}

