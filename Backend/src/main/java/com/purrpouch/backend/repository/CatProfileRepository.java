package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.CatProfile;
import com.purrpouch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatProfileRepository extends JpaRepository<CatProfile, Long> {
    
    // Find all non-deleted cat profiles for a specific user
    @Query("SELECT c FROM CatProfile c WHERE c.owner = :user AND c.deletedAt IS NULL")
    List<CatProfile> findByUser(@Param("user") User user);
    
    // Find a specific non-deleted cat profile by id and user
    @Query("SELECT c FROM CatProfile c WHERE c.id = :id AND c.owner = :user AND c.deletedAt IS NULL")
    Optional<CatProfile> findByIdAndUser(@Param("id") Long id, @Param("user") User user);
    
    // Check if a cat profile exists for a user with a specific name (case insensitive)
    boolean existsByNameIgnoreCaseAndOwnerAndDeletedAtIsNull(String name, User user);
    
    // For admin purposes - find all cat profiles including deleted ones
    List<CatProfile> findAllByOwner(User user);
}