package com.beraka.siv.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private Long id;
    private String sku; // Lo generará el backend, no se envía desde el front
    private String name;
    private String description;
    private BigDecimal price;
    private Integer minStock;
    private String imageUrl;

    // Relación con Categoría
    private Long categoryId;
    private String categoryName; // Solo lectura (para devolver al Front)
}