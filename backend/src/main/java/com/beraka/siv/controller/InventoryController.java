package com.beraka.siv.controller;

import com.beraka.siv.model.dto.StockAdjustRequest;
import com.beraka.siv.model.dto.StockDto;
import com.beraka.siv.model.dto.StockEntryRequest;
import com.beraka.siv.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    // Solo ADMIN abastece
    @PostMapping("/entry")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<StockDto> addStock(@RequestBody StockEntryRequest request) {
        return ResponseEntity.ok(inventoryService.addStock(request));
    }

    // Solo ADMIN hace ajustes manuales
    @PostMapping("/adjust")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<StockDto> adjustStock(@RequestBody StockAdjustRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }

    // TODOS (Admin y Vendedores) pueden consultar dónde hay inventario
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockDto>> getStockByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getStockByProduct(productId));
    }
}