package com.beraka.siv.model.dto;
import lombok.Data;

@Data
public class SaleItemRequest {
    private Long productId;
    private String size; 
    private Integer quantity;
}