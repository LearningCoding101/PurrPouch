package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.Delivery;
import com.purrpouch.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByOrder(Order order);

    List<Delivery> findByOrderUserId(Long userId);

    List<Delivery> findByStatusAndScheduledTimeBefore(
            Delivery.DeliveryStatus status, LocalDateTime time);
}
