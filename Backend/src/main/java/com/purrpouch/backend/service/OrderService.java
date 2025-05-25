package com.purrpouch.backend.service;

import com.purrpouch.backend.model.*;
import com.purrpouch.backend.repository.FoodKitRepository;
import com.purrpouch.backend.repository.OrderKitRepository;
import com.purrpouch.backend.repository.OrderRepository;
import com.purrpouch.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create the order
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
        return orderRepository.save(order);
    }
}
