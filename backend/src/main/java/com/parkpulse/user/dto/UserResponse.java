package com.parkpulse.user.dto;

import com.parkpulse.user.Role;
import com.parkpulse.user.User;
import com.parkpulse.user.UserStatus;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserResponse(
    UUID id,
    String email,
    String fullName,
    String phoneNumber,
    String plateRaw,
    String plateNormalized,
    UserStatus status,
    Set<String> roles,
    Instant createdAt
) {
    public static UserResponse fromEntity(User user, boolean includePhone) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            includePhone ? user.getPhoneNumber() : null,
            user.getPlateRaw(),
            user.getPlateNormalized(),
            user.getStatus(),
            user.getRoles().stream().map(Role::getId).collect(Collectors.toSet()),
            user.getCreatedAt()
        );
    }
}

