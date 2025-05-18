package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByFirebaseUid(String firebaseUid);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByFirebaseUid(String firebaseUid);
}