package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findByPhoneNumberAndCodeAndTypeAndUsedFalse(
            String phoneNumber, String code, OtpVerification.OtpType type);

    Optional<OtpVerification> findByEmailAndCodeAndTypeAndUsedFalse(
            String email, String code, OtpVerification.OtpType type);

    @Query("SELECT o FROM OtpVerification o WHERE o.phoneNumber = :phoneNumber AND o.type = :type AND o.used = false ORDER BY o.createdAt DESC")
    Optional<OtpVerification> findLatestByPhoneNumberAndType(
            @Param("phoneNumber") String phoneNumber,
            @Param("type") OtpVerification.OtpType type);

    @Query("SELECT o FROM OtpVerification o WHERE o.email = :email AND o.type = :type AND o.used = false ORDER BY o.createdAt DESC")
    Optional<OtpVerification> findLatestByEmailAndType(
            @Param("email") String email,
            @Param("type") OtpVerification.OtpType type);

    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.used = true WHERE o.phoneNumber = :phoneNumber AND o.type = :type")
    void markAllAsUsedByPhoneNumberAndType(
            @Param("phoneNumber") String phoneNumber,
            @Param("type") OtpVerification.OtpType type);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.used = true WHERE o.email = :email AND o.type = :type")
    void markAllAsUsedByEmailAndType(
            @Param("email") String email,
            @Param("type") OtpVerification.OtpType type);
}
