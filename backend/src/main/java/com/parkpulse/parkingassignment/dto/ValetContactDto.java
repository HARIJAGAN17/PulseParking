package com.parkpulse.parkingassignment.dto;

import java.time.Instant;
import java.util.UUID;

public record ValetContactDto(
    UUID assignmentId,
    String employeeName,
    String phoneNumber,
    String email,
    String plateNumber,
    String spaceLabel,
    Instant assignedAt
) {}

