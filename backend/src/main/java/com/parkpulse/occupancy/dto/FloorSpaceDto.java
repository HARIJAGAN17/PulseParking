package com.parkpulse.occupancy.dto;

import com.parkpulse.parkingspace.SpaceStatus;

import java.time.Instant;
import java.util.UUID;

public record FloorSpaceDto(
    UUID spaceId,
    UUID areaId,
    String spaceLabel,
    SpaceStatus status,
    int displayOrder,
    boolean isOwnVehicle,
    String plateNumber,
    UUID assignmentId,
    String employeeName,
    boolean isGuest,
    Instant assignedAt
) {}

