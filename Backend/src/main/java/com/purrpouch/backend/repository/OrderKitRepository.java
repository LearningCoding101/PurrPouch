package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.OrderKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderKitRepository extends JpaRepository<OrderKit, Long> {
    List<OrderKit> findByOrder(Order order);

    List<OrderKit> findByOrderId(Long orderId);
}