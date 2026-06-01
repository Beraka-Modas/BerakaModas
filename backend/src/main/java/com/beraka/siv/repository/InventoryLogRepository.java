package com.beraka.siv.repository;

import com.beraka.siv.model.entity.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

	void deleteByProductId(Long productId);

	List<InventoryLog> findByProductId(Long productId);
}