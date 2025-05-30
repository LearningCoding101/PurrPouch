package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Query to find recurring orders
    List<Order> findByIsRecurringTrue(); // Query to find recurring orders due for next delivery

    List<Order> findByIsRecurringTrueAndNextDeliveryDateBetween(
            LocalDateTime start, LocalDateTime end);

    // Query to find order by payment UUID
    Order findByPaymentUuid(String paymentUuid);
}