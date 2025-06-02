package com.purrpouch.backend.service;

import com.purrpouch.backend.model.*;
import com.purrpouch.backend.repository.FoodKitRepository;
import com.purrpouch.backend.repository.OrderKitRepository;
import com.purrpouch.backend.repository.OrderRepository;
import com.purrpouch.backend.repository.UserRepository;
import com.purrpouch.backend.repository.UserAddressRepository;
import com.purrpouch.backend.event.OrderEvent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderKitRepository orderKitRepository;

    @Autowired
    private FoodKitRepository foodKitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAddressRepository userAddressRepository;
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private UserAddressService userAddressService;

    @Autowired
    private PaymentNotificationService paymentNotificationService;

    /**
     * Create a new order with the provided meal kits
     * 
     * @param userId     User ID
     * @param kitItems   Map of kit IDs and their quantities
     * @param totalPrice Total price of the order
     * @return Created order
     */
    @Transactional
    public Order createOrder(Long userId, Map<Long, Integer> kitItems, BigDecimal totalPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")); // Create the order
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus(Order.OrderStatus.PENDING);
        Order savedOrder = orderRepository.save(order);

        // Add kit items to the order
        for (Map.Entry<Long, Integer> entry : kitItems.entrySet()) {
            Long kitId = entry.getKey();
            Integer quantity = entry.getValue();

            FoodKit foodKit = foodKitRepository.findById(kitId)
                    .orElseThrow(() -> new RuntimeException("Food kit not found: " + kitId));

            OrderKit orderKit = new OrderKit();
            orderKit.setOrder(savedOrder);
            orderKit.setFoodKit(foodKit);
            orderKit.setKitQuantity(quantity);
            orderKitRepository.save(orderKit);
        }

        // Publish order created event
        eventPublisher.publishEvent(new OrderEvent(this, savedOrder, OrderEvent.OrderEventType.CREATED));

        return savedOrder;
    }

    /**
     * Create a new order with the provided meal kits, with recurring options and
     * delivery address ID
     */
    @Transactional
    public Order createOrderWithDeliveryAddress(Long userId, Map<Long, Integer> kitItems, BigDecimal totalPrice,
            boolean isRecurring, Order.RecurringFrequency frequency, LocalTime deliveryTime,
            Long deliveryAddressId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve the UserAddress
        UserAddress userAddress = userAddressService.getAddressById(userId, deliveryAddressId);

        // Create the order
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(userAddress); // Set the delivery address reference

        // Set recurring details if applicable
        if (isRecurring) {
            order.setRecurring(true);
            order.setRecurringFrequency(frequency);
            order.setPreferredDeliveryTime(deliveryTime);

            // Calculate next delivery date based on frequency
            LocalDateTime nextDelivery = calculateNextDeliveryDate(LocalDateTime.now(), frequency);
            order.setNextDeliveryDate(nextDelivery);
        }

        Order savedOrder = orderRepository.save(order);

        // Add kit items to the order
        for (Map.Entry<Long, Integer> entry : kitItems.entrySet()) {
            Long kitId = entry.getKey();
            Integer quantity = entry.getValue();

            FoodKit foodKit = foodKitRepository.findById(kitId)
                    .orElseThrow(() -> new RuntimeException("Food kit not found: " + kitId));

            OrderKit orderKit = new OrderKit();
            orderKit.setOrder(savedOrder);
            orderKit.setFoodKit(foodKit);
            orderKit.setKitQuantity(quantity);
            orderKitRepository.save(orderKit);
        }

        // Publish order created event with delivery information
        eventPublisher.publishEvent(new OrderEvent(this, savedOrder, OrderEvent.OrderEventType.CREATED));

        return savedOrder;
    }

    /**
     * Get all orders for a user
     * 
     * @param userId User ID
     * @return List of orders
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get order details by ID
     * 
     * @param orderId Order ID
     * @return Order
     */
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    /**
     * Get all kits in an order
     * 
     * @param orderId Order ID
     * @return List of order kits
     */
    public List<OrderKit> getOrderKits(Long orderId) {
        return orderKitRepository.findByOrderId(orderId);
    }

    /**
     * Update order status
     * 
     * @param orderId Order ID
     * @param status  New status
     * @return Updated order
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);

        // Save the order with updated status
        Order updatedOrder = orderRepository.save(order);

        // Send WebSocket notification about the status change
        paymentNotificationService.sendPaymentStatusUpdate(orderId, status.toString());

        return updatedOrder;
    }

    /**
     * Set payment UUID for an order
     * 
     * @param orderId     Order ID
     * @param paymentUuid Payment UUID from VietQR
     * @return Updated order
     */
    @Transactional
    public Order setPaymentUuid(Long orderId, String paymentUuid) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentUuid(paymentUuid);
        return orderRepository.save(order);
    }

    /**
     * Calculate the next delivery date based on frequency
     */
    private LocalDateTime calculateNextDeliveryDate(LocalDateTime fromDate, Order.RecurringFrequency frequency) {
        switch (frequency) {
            case DAILY:
                return fromDate.plusDays(1);
            case WEEKLY:
                return fromDate.plusWeeks(1);
            case BIWEEKLY:
                return fromDate.plusWeeks(2);
            case MONTHLY:
                return fromDate.plusMonths(1);
            default:
                return fromDate.plusDays(1);
        }
    }

    /**
     * Get recurring orders due for processing
     */
    public List<Order> getRecurringOrdersDueForProcessing(LocalDateTime targetDate) {
        return orderRepository.findByIsRecurringTrueAndNextDeliveryDateBetween(
                targetDate.toLocalDate().atStartOfDay(),
                targetDate.toLocalDate().atTime(23, 59, 59));
    }

    /**
     * Create a new instance of a recurring order
     */
    @Transactional
    public Order createRecurringOrderInstance(Order parentOrder) {
        // Create a new order based on the parent
        Order newOrder = new Order();
        newOrder.setUser(parentOrder.getUser());
        newOrder.setTotalPrice(parentOrder.getTotalPrice());
        newOrder.setStatus(Order.OrderStatus.PENDING);
        newOrder.setRecurring(false); // This is a one-time instance
        newOrder.setParentOrder(parentOrder);
        Order savedOrder = orderRepository.save(newOrder);

        // Copy the kit items
        List<OrderKit> parentKits = orderKitRepository.findByOrderId(parentOrder.getId());
        for (OrderKit parentKit : parentKits) {
            OrderKit newKit = new OrderKit();
            newKit.setOrder(savedOrder);
            newKit.setFoodKit(parentKit.getFoodKit());
            newKit.setKitQuantity(parentKit.getKitQuantity());
            orderKitRepository.save(newKit);
        }

        return savedOrder;
    }

    /**
     * Update the next delivery date for a recurring order
     */
    @Transactional
    public void updateNextDeliveryDate(Order order) {
        if (!order.isRecurring()) {
            return;
        }

        order.setNextDeliveryDate(calculateNextDeliveryDate(order.getNextDeliveryDate(),
                order.getRecurringFrequency()));
        orderRepository.save(order);
    }

    /**
     * Get delivery address for an order
     */
    public Address getDeliveryAddress(Long orderId) {
        // This method needs to be refactored to avoid circular dependency
        // In the short term, we can return a default address
        Address defaultAddress = new Address();
        defaultAddress.setStreetAddress("Default Address");
        defaultAddress.setCity("Default City");
        defaultAddress.setDistrict("Default District");
        return defaultAddress;

        // Original implementation with circular dependency:
        // List<Delivery> deliveries = deliveryService.getOrderDeliveries(orderId);
        // if (!deliveries.isEmpty()) {
        // // Sort by ID descending to get latest
        // deliveries.sort((d1, d2) -> Long.compare(d2.getId(), d1.getId()));
        // return deliveries.get(0).getDeliveryAddress();
        // }
        // return null;
    }
}
