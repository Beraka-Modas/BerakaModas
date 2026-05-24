package com.beraka.siv.model.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SaleResponse {
    private Long saleId;
    private LocalDateTime date;
    private BigDecimal total;
    private String paymentMethod;
    private String status;
    private String branchName;
    private String sellerName;
}