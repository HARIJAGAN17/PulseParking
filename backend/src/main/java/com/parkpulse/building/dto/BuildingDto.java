package com.parkpulse.building.dto;

import com.parkpulse.building.Building;
import java.util.UUID;

public record BuildingDto(
        UUID id,
        String name,
        String code,
        String address,
        int displayOrder,
        boolean isActive) {
    public static BuildingDto fromEntity(Building b) {
        return new BuildingDto(b.getId(), b.getName(), b.getCode(), b.getAddress(), b.getDisplayOrder(), b.isActive());
    }
}
