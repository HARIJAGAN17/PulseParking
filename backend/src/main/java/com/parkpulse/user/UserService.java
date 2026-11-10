package com.parkpulse.user;

import com.parkpulse.common.ConflictException;
import com.parkpulse.common.PlateNormalizer;
import com.parkpulse.common.ResourceNotFoundException;
import com.parkpulse.user.dto.ProfileUpdateRequest;
import com.parkpulse.user.dto.RegisterRequest;
import com.parkpulse.user.dto.UserResponse;
import com.parkpulse.user.dto.ValetCreateRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerEmployee(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("An account with this email address already exists.");
        }

        Role employeeRole = roleRepository.findById(Role.ROLE_EMPLOYEE)
                .orElseThrow(() -> new ResourceNotFoundException("Role EMPLOYEE not initialized."));

        String normalizedPlate = PlateNormalizer.normalize(request.plateNumber());

        User user = new User(
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.phoneNumber().trim(),
                request.plateNumber().trim(),
                normalizedPlate,
                UserStatus.PENDING);
        user.getRoles().add(employeeRole);

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved, true);
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = findById(userId);
        user.setFullName(request.fullName().trim());
        user.setPhoneNumber(request.phoneNumber().trim());

        if (request.plateNumber() != null && !request.plateNumber().isBlank()) {
            user.setPlateRaw(request.plateNumber().trim());
            user.setPlateNormalized(PlateNormalizer.normalize(request.plateNumber()));
        }

        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated, true);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsersByStatus(UserStatus status, boolean includePhone) {
        return userRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(u -> UserResponse.fromEntity(u, includePhone))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listAllUsers(boolean includePhone) {
        return userRepository.findAll().stream()
                .map(u -> UserResponse.fromEntity(u, includePhone))
                .toList();
    }

    public UserResponse approveUser(UUID userId) {
        User user = findById(userId);
        user.setStatus(UserStatus.APPROVED);
        return UserResponse.fromEntity(userRepository.save(user), true);
    }

    public UserResponse rejectUser(UUID userId) {
        User user = findById(userId);
        user.setStatus(UserStatus.REJECTED);
        return UserResponse.fromEntity(userRepository.save(user), true);
    }

    public UserResponse createValet(ValetCreateRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("An account with this email already exists.");
        }

        Role valetRole = roleRepository.findById(Role.ROLE_VALET)
                .orElseThrow(() -> new ResourceNotFoundException("Role VALET not initialized."));

        User user = new User(
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.phoneNumber().trim(),
                null,
                null,
                UserStatus.APPROVED);
        user.getRoles().add(valetRole);

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved, true);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listValets() {
        return userRepository.findByRoleId(Role.ROLE_VALET).stream()
                .map(u -> UserResponse.fromEntity(u, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listApprovedEmployeesWithPlates() {
        return userRepository.findApprovedUsersWithPlates().stream()
                .map(u -> UserResponse.fromEntity(u, false))
                .toList();
    }
}
