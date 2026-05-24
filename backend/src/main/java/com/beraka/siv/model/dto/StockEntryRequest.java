package com.beraka.siv.model.dto;
import lombok.Data;

@Data
public class StockEntryRequest {
    private Long productId;
    private Long branchId;
    private String size; // S, M, L, XL, Única
    private Integer quantity; // Cantidad a sumar
}