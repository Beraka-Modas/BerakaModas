package com.beraka.siv.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sale")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp // Genera automáticamente la fecha y hora actual del servidor
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod; // RF-18: Efectivo, Tarjeta, Transferencia

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total; // RF-17: Cálculo automático

    @Column(nullable = false, length = 15)
    private String status = "ACTIVA"; // RF-19: ACTIVA o ANULADA

    // Quién hizo la venta y en qué sucursal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
}