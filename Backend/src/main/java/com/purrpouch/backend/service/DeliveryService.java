package com.purrpouch.backend.service;

import com.purrpouch.backend.event.OrderEvent;
import com.purrpouch.backend.model.Delivery;
import com.purrpouch.backend.model.Order;
import com.purrpouch.backend.model.UserAddress;
import com.purrpouch.backend.repository.DeliveryRepository;
import com.purrpouch.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryService {
    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Schedule a delivery for an order
     */
    @Transactional
    public Delivery scheduleDelivery(Order order, LocalDateTime deliveryTime, UserAddress address) {
        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setScheduledTime(deliveryTime);
        delivery.setStatus(Delivery.DeliveryStatus.PENDING);
        delivery.setDeliveryAddress(address.toAddress());

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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return deliveryRepository.findByOrder(order);
    }

    /**
     * Scheduled task to generate recurring orders
     * Runs daily at midnight
     */
    /*
     * Temporarily commented out to resolve circular dependency
     * 
     * @Scheduled(cron = "0 0 0 * * ?")
     * 
     * @Transactional
     * public void processRecurringOrders() {
     * LocalDateTime now = LocalDateTime.now();
     * LocalDateTime tomorrow = now.plusDays(1);
     * 
     * // Get all orders that need to be processed for tomorrow
     * List<Order> ordersToProcess =
     * orderService.getRecurringOrdersDueForProcessing(tomorrow);
     * 
     * for (Order order : ordersToProcess) {
     * // Create new instance of the recurring order
     * Order newOrder = orderService.createRecurringOrderInstance(order);
     * 
     * // Schedule delivery for the new order
     * LocalDateTime deliveryTime = tomorrow.with(order.getPreferredDeliveryTime());
     * scheduleDelivery(newOrder, deliveryTime,
     * orderService.getDeliveryAddress(order.getId()));
     * 
     * // Update next delivery date on parent order
     * orderService.updateNextDeliveryDate(order);
     * }
     * }
     */ @EventListener
    public void handleOrderEvent(OrderEvent event) {
        if (event.getEventType() == OrderEvent.OrderEventType.CREATED) {
            Order order = event.getOrder();
            // If the order has delivery time info, schedule a delivery
            if (order.getPreferredDeliveryTime() != null && order.getDeliveryAddress() != null) {
                // Schedule delivery with the order's delivery address
                UserAddress userAddress = order.getDeliveryAddress();

                // Schedule delivery for the next day if nextDeliveryDate is not set
                LocalDateTime deliveryTime;
                if (order.getNextDeliveryDate() != null) {
                    // Combine the date from nextDeliveryDate with the time from
                    // preferredDeliveryTime
                    deliveryTime = LocalDateTime.of(
                            order.getNextDeliveryDate().toLocalDate(),
                            order.getPreferredDeliveryTime());
                } else {
                    // Use tomorrow with the preferred time
                    deliveryTime = LocalDateTime.now().plusDays(1)
                            .withHour(order.getPreferredDeliveryTime().getHour())
                            .withMinute(order.getPreferredDeliveryTime().getMinute())
                            .withSecond(0)
                            .withNano(0);
                }

                scheduleDelivery(order, deliveryTime, userAddress);
            }
        }
    }

    /**
     * Admin method: Get all deliveries for admin panel
     */
    public List<Delivery> getAllDeliveriesForAdmin() {
        return deliveryRepository.findAll();
    }

    /**
     * Admin method: Get all deliveries for admin panel with pagination and
     * filtering
     */
    public Page<Delivery> getAllDeliveriesForAdmin(Pageable pageable, String status) {
        if (status != null && !status.isEmpty()) {
            try {
                // Just validate the status is valid, but use basic pagination for now
                Delivery.DeliveryStatus.valueOf(status);
                // Using basic pagination for now, can add dedicated repository method later
                return deliveryRepository.findAll(pageable);
            } catch (IllegalArgumentException e) {
                // Invalid status, return all deliveries
                return deliveryRepository.findAll(pageable);
            }
        }
        return deliveryRepository.findAll(pageable);
    }

    /**
     * Admin method: Update delivery status by admin
     */
    @Transactional
    public Delivery updateDeliveryStatusByAdmin(Long deliveryId, Delivery.DeliveryStatus newStatus) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found with id: " + deliveryId));

        delivery.setStatus(newStatus);

        if (newStatus == Delivery.DeliveryStatus.DELIVERED) {
            delivery.setDeliveredTime(LocalDateTime.now());
        }

        return deliveryRepository.save(delivery);
    }

    /**
     * Admin method: Get deliveries by status for admin panel
     */
    public List<Delivery> getDeliveriesByStatusForAdmin(Delivery.DeliveryStatus status) {
        return deliveryRepository.findAll().stream()
                .filter(delivery -> delivery.getStatus().equals(status))
                .toList();
    }

    /**
     * Admin method: Get deliveries by order for admin panel
     */
    public List<Delivery> getDeliveriesByOrderForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return deliveryRepository.findByOrder(order);
    }
}
