package com.parkpulse.parkingspace.dto;

import com.parkpulse.parkingspace.ParkingSpace;
import com.parkpulse.parkingspace.SpaceStatus;

import java.time.Instant;
import java.util.UUID;

public record ParkingSpaceDto(
    UUID id,
    UUID spaceId,
    UUID areaId,
    String spaceLabel,
    SpaceStatus status,
    boolean isActive,
    int displayOrder,
    Instant createdAt,
    Instant updatedAt
) {
    public static ParkingSpaceDto fromEntity(ParkingSpace space) {
        return new ParkingSpaceDto(
            space.getId(),
            space.getId(),
            space.getParkingArea() != null ? space.getParkingArea().getId() : null,
            space.getSpaceLabel(),
            space.getStatus(),
            space.isActive(),
            space.getDisplayOrder(),
            space.getCreatedAt(),
            space.getUpdatedAt()
        );
    }
}

