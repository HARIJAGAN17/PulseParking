package com.parkpulse.user;

import com.parkpulse.common.ApiResponse;
import com.parkpulse.security.UserPrincipal;
import com.parkpulse.user.dto.ProfileUpdateRequest;
import com.parkpulse.user.dto.UserResponse;
import com.parkpulse.user.dto.ValetCreateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        UserResponse response = userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers(
            @RequestParam(required = false) UserStatus status
    ) {
        List<UserResponse> users = (status != null)
                ? userService.listUsersByStatus(status, true)
                : userService.listAllUsers(true);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PostMapping("/admin/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> approveUser(@PathVariable UUID id) {
        UserResponse user = userService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User approved successfully", user));
    }

    @PostMapping("/admin/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> rejectUser(@PathVariable UUID id) {
        UserResponse user = userService.rejectUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User rejected", user));
    }

    @PostMapping("/admin/valets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createValet(@Valid @RequestBody ValetCreateRequest request) {
        UserResponse valet = userService.createValet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Valet created successfully", valet));
    }

    @GetMapping("/admin/valets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listValets() {
        return ResponseEntity.ok(ApiResponse.ok(userService.listValets()));
    }
}

