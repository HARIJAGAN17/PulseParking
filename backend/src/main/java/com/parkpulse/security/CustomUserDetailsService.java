package com.parkpulse.security;

import com.parkpulse.user.User;
import com.parkpulse.user.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (user.getStatus() == com.parkpulse.user.UserStatus.PENDING) {
            throw new DisabledException("Your account registration is pending admin approval.");
        }
        if (user.getStatus() == com.parkpulse.user.UserStatus.REJECTED) {
            throw new DisabledException("Your account registration was not approved. Please contact facility administration.");
        }
        if (user.getStatus() == com.parkpulse.user.UserStatus.DISABLED) {
            throw new DisabledException("Your account has been deactivated.");
        }

        return new UserPrincipal(user);
    }
}

