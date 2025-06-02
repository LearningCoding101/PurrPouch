package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.User;
import com.purrpouch.backend.model.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    List<UserAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<UserAddress> findByUserAndIsDefaultTrue(User user);

    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Long userId);

    List<UserAddress> findByUser(User user);

    List<UserAddress> findByUserId(Long userId);

    @Query("SELECT a FROM UserAddress a WHERE a.id = :id AND a.user.id = :userId")
    Optional<UserAddress> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
