package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Payment UUID for VietQR payment tracking
    private String paymentUuid;

    // Recurring order fields
    private boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    private RecurringFrequency recurringFrequency;

    private LocalTime preferredDeliveryTime;
    private LocalDateTime nextDeliveryDate;

    // If this is a recurring instance, link to parent order
    @ManyToOne
    @JoinColumn(name = "parent_order_id")
    private Order parentOrder;

    // Delivery address reference
    @ManyToOne
    @JoinColumn(name = "delivery_address_id")
    private UserAddress deliveryAddress;

    public enum OrderStatus {
        PENDING, PAID, FAILED, CANCELLED
    }

    public enum RecurringFrequency {
        DAILY, WEEKLY, BIWEEKLY, MONTHLY
    }
}
