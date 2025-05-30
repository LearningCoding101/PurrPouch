package com.purrpouch.backend.event;

import com.purrpouch.backend.model.Order;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class OrderEvent extends ApplicationEvent {
    private final Order order;
    private final OrderEventType eventType;

    public OrderEvent(Object source, Order order, OrderEventType eventType) {
        super(source);
        this.order = order;
        this.eventType = eventType;
    }

    public enum OrderEventType {
        CREATED,
        UPDATED,
        CANCELLED
    }
}
