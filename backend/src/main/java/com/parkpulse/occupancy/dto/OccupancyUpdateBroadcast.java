package com.parkpulse.occupancy.dto;

import com.parkpulse.parkingspace.SpaceStatus;

import java.time.Instant;
import java.util.UUID;

public record OccupancyUpdateBroadcast(
    UUID spaceId,
    UUID buildingId,
    UUID areaId,
    SpaceStatus status,
    Long version,
    Instant timestamp
) {}

