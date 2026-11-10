package com.parkpulse.user;

import com.parkpulse.common.ConflictException;
import com.parkpulse.user.dto.ProfileUpdateRequest;
import com.parkpulse.user.dto.RegisterRequest;
import com.parkpulse.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private Role employeeRole;

    @BeforeEach
    void setUp() {
        employeeRole = new Role(Role.ROLE_EMPLOYEE, "Employee");
    }

    @Test
    @DisplayName("Registration should create PENDING user with normalized plate")
    void testRegisterEmployeeSuccess() {
        RegisterRequest req = new RegisterRequest(
                "john.doe@acme.com", "Secret@123", "John Doe", "+91 99887 76655", "ka 05-mc 1234"
        );

        when(userRepository.existsByEmailIgnoreCase(req.email())).thenReturn(false);
        when(roleRepository.findById(Role.ROLE_EMPLOYEE)).thenReturn(Optional.of(employeeRole));
        when(passwordEncoder.encode(req.password())).thenReturn("encodedSecret");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        UserResponse res = userService.registerEmployee(req);

        assertNotNull(res);
        assertEquals(UserStatus.PENDING, res.status());
        assertEquals("KA05MC1234", res.plateNormalized());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Registration should reject duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest(
                "existing@acme.com", "Secret@123", "Existing User", "+91 99887 76655", "KA05MC1234"
        );
        when(userRepository.existsByEmailIgnoreCase(req.email())).thenReturn(true);

        assertThrows(ConflictException.class, () -> userService.registerEmployee(req));
    }

    @Test
    @DisplayName("Admin can approve pending user")
    void testApproveUser() {
        UUID userId = UUID.randomUUID();
        User pendingUser = new User("emp@acme.com", "hash", "Emp", "+9199", "KA01", "KA01", UserStatus.PENDING);
        pendingUser.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserResponse res = userService.approveUser(userId);

        assertEquals(UserStatus.APPROVED, res.status());
        verify(userRepository).save(pendingUser);
    }

    @Test
    @DisplayName("Employee can update phone number and plate in profile")
    void testUpdateProfile() {
        UUID userId = UUID.randomUUID();
        User user = new User("emp@acme.com", "hash", "Emp", "+91 11111 11111", "KA01", "KA01", UserStatus.APPROVED);
        user.setId(userId);

        ProfileUpdateRequest updateReq = new ProfileUpdateRequest("Emp Updated", "+91 99999 99999", "DL 01-AB 9999");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserResponse updated = userService.updateProfile(userId, updateReq);

        assertEquals("+91 99999 99999", updated.phoneNumber());
        assertEquals("DL01AB9999", updated.plateNormalized());
    }
}

