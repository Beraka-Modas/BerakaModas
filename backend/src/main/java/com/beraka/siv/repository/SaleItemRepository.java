package com.beraka.siv.repository;

import com.beraka.siv.model.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

	void deleteByProductId(Long productId);
}