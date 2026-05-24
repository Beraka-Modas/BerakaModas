package com.beraka.siv.model.dto;
import lombok.Data;

@Data
public class StockAdjustRequest {
    private Long productId;
    private Long branchId;
    private String size;
    private Integer newQuantity; // La cantidad que va a quedar (sobrescribe la anterior)
    private String reason; // Obligatorio según RNF
}