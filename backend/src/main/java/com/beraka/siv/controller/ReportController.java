package com.beraka.siv.controller;

import com.beraka.siv.model.dto.ReportDto;
import com.beraka.siv.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')") // RNF-04: RBAC estricto
    public ResponseEntity<ReportDto> getDailyReport() {
        return ResponseEntity.ok(reportService.getDailyReport());
    }
}