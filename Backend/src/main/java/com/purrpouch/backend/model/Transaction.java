package com.purrpouch.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    private String paymentProvider = "vnpay";

    private String providerTransactionId;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.INITIATED;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionStatus {
        INITIATED, SUCCESS, FAILED, REFUNDED
    }
}
