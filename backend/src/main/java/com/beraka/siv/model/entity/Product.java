package com.beraka.siv.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku; // RF-01: Código único

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Usamos BigDecimal para dinero, es más preciso que Double
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "min_stock", nullable = false)
    private Integer minStock = 0; // RF-13: Umbral de alertas

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    // Relación Mucho a Uno (Muchos productos pertenecen a 1 categoría)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}