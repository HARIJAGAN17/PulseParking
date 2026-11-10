package com.parkpulse.parkingarea.dto;

import com.parkpulse.parkingarea.ParkingArea;
import java.util.UUID;

public record ParkingAreaDto(
        UUID id,
        UUID buildingId,
        String buildingName,
        String name,
        String levelCode,
        int displayOrder,
        boolean isActive) {
    public static ParkingAreaDto fromEntity(ParkingArea a) {
        return new ParkingAreaDto(
                a.getId(),
                a.getBuilding().getId(),
                a.getBuilding().getName(),
                a.getName(),
                a.getLevelCode(),
                a.getDisplayOrder(),
                a.isActive());
    }
}
