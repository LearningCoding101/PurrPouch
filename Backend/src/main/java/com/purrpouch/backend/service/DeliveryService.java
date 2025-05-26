package com.purrpouch.backend.service;

import com.purrpouch.backend.model.Delivery;
import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.Address;
import com.purrpouch.backend.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderService orderService;

    /**
     * Schedule a delivery for an order
     */
    @Transactional
    public Delivery scheduleDelivery(Order order, LocalDateTime deliveryTime, Address address) {
        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setScheduledTime(deliveryTime);
        delivery.setStatus(Delivery.DeliveryStatus.PENDING);
        delivery.setDeliveryAddress(address);

        return deliveryRepository.save(delivery);
    }

    /**
     * Update delivery status
     */
    @Transactional
    public Delivery updateDeliveryStatus(Long deliveryId, Delivery.DeliveryStatus status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        delivery.setStatus(status);

        if (status == Delivery.DeliveryStatus.DELIVERED) {
            delivery.setDeliveredTime(LocalDateTime.now());
        }

        return deliveryRepository.save(delivery);
    }

    /**
     * Get all deliveries for a user
     */
    public List<Delivery> getUserDeliveries(Long userId) {
        return deliveryRepository.findByOrderUserId(userId);
    }

    /**
     * Get all deliveries for an order
     */
    public List<Delivery> getOrderDeliveries(Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return deliveryRepository.findByOrder(order);
    }

    /**
     * Scheduled task to generate recurring orders
     * Runs daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processRecurringOrders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        // Get all orders that need to be processed for tomorrow
        List<Order> ordersToProcess = orderService.getRecurringOrdersDueForProcessing(tomorrow);

        for (Order order : ordersToProcess) {
            // Create new instance of the recurring order
            Order newOrder = orderService.createRecurringOrderInstance(order);

            // Schedule delivery for the new order
            LocalDateTime deliveryTime = tomorrow.with(order.getPreferredDeliveryTime());
            scheduleDelivery(newOrder, deliveryTime, orderService.getDeliveryAddress(order.getId()));

            // Update next delivery date on parent order
            orderService.updateNextDeliveryDate(order);
        }
    }
}
