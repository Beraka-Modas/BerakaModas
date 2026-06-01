package com.beraka.siv.service;

import com.beraka.siv.model.dto.ReportDto;
import com.beraka.siv.model.dto.SaleDetailDto;
import com.beraka.siv.model.dto.SaleItemDetailDto;
import com.beraka.siv.model.entity.Sale;
import com.beraka.siv.model.entity.SaleItem;
import com.beraka.siv.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;

    public ReportDto getDailyReport() {
        // 1. Definir el rango del día de hoy (Desde las 00:00 hasta las 23:59)
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        // 2. Traer todas las ventas válidas (ACTIVAS) de hoy
        List<Sale> dailySales = saleRepository.findByCreatedAtBetweenAndStatus(startOfDay, endOfDay, "ACTIVA");

        // 3. Sumar el Total General
        BigDecimal totalSales = dailySales.stream()
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Agrupar y sumar por Método de Pago (RF-22)
        Map<String, BigDecimal> byPaymentMethod = dailySales.stream()
                .collect(Collectors.groupingBy(
                        Sale::getPaymentMethod,
                        Collectors.reducing(BigDecimal.ZERO, Sale::getTotal, BigDecimal::add)
                ));

        // 5. Armar la respuesta
        ReportDto report = new ReportDto();
        report.setTotalSales(totalSales);
        report.setTotalTransactions(dailySales.size());
        report.setSalesByPaymentMethod(byPaymentMethod);

        return report;
    }

    public List<SaleDetailDto> getDailySalesDetailed() {
        // Definir el rango del día de hoy
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        // Traer todas las ventas activas de hoy
        List<Sale> dailySales = saleRepository.findByCreatedAtBetweenAndStatus(startOfDay, endOfDay, "ACTIVA");

        // Mapear cada venta a SaleDetailDto con sus items
        return dailySales.stream()
                .map(sale -> {
                    SaleDetailDto dto = new SaleDetailDto(
                            sale.getId(),
                            sale.getCreatedAt(),
                            sale.getTotal(),
                            sale.getPaymentMethod(),
                            sale.getStatus(),
                            sale.getBranch().getName(),
                            sale.getUser().getUsername()
                    );

                    // Mapear items de la venta
                    List<SaleItemDetailDto> items = sale.getItems().stream()
                            .map(item -> new SaleItemDetailDto(
                                    item.getProduct().getName(),
                                    item.getSize() != null ? item.getSize() : "M",
                                    item.getQuantity(),
                                    item.getUnitPrice()
                            ))
                            .collect(Collectors.toList());

                    dto.setItems(items);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}