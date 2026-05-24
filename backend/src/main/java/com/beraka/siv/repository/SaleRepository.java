package com.beraka.siv.repository;

import com.beraka.siv.model.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Busca las ventas entre un rango de fechas (ej: de 00:00 a 23:59 de hoy) que estén ACTIVAS
    List<Sale> findByCreatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);
}