package com.beraka.siv.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ReportDto {
    private BigDecimal totalSales; // Todo lo que se vendió en dinero
    private int totalTransactions; // Número de facturas (tickets)
    private Map<String, BigDecimal> salesByPaymentMethod; // Desglose: Efectivo, Tarjeta, etc.
}