package com.beraka.siv.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock", uniqueConstraints = {
        // Pro-tip: Evitamos que haya dos registros iguales de la misma talla para el mismo producto en el mismo local
        @UniqueConstraint(columnNames = {"product_id", "branch_id", "size"})
})
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String size; // RF-12: S, M, L, XL, Única

    @Column(nullable = false)
    private Integer quantity; // RF-08: Cantidad física

    // Relaciones (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
}