package com.parkpulse.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByStatusOrderByCreatedAtDesc(UserStatus status);

    Optional<User> findByPlateNormalized(String plateNormalized);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.id = :roleId ORDER BY u.fullName ASC")
    List<User> findByRoleId(@Param("roleId") String roleId);

    @Query("SELECT u FROM User u WHERE u.status = 'APPROVED' AND u.plateNormalized IS NOT NULL ORDER BY u.fullName ASC")
    List<User> findApprovedUsersWithPlates();
}

