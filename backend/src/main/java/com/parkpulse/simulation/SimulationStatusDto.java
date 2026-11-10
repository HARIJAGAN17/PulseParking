package com.parkpulse.simulation;

public record SimulationStatusDto(
    boolean isRunning,
    int intervalSeconds,
    long activeSimulatedVehicles,
    long totalSimulatedEvents
) {}

