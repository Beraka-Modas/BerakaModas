package com.beraka.siv.repository;

import com.beraka.siv.model.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    // Busca si ya existe un registro exacto de esa prenda, en ese local y en esa talla
    Optional<Stock> findByProductIdAndBranchIdAndSize(Long productId, Long branchId, String size);
    
    List<Stock> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}