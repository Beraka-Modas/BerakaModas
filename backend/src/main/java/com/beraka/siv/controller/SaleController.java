package com.beraka.siv.controller;

import com.beraka.siv.model.dto.SaleRequest;
import com.beraka.siv.model.dto.SaleResponse;
import com.beraka.siv.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;

    // TODOS pueden hacer ventas (Vendedores y Admin)
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.processSale(request));
    }
}