package com.beraka.siv.model.dto;
import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {
    private Long branchId; // En qué local se hace la venta
    private String paymentMethod;
    private List<SaleItemRequest> items; // La lista de productos
}