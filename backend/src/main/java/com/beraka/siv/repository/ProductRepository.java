package com.beraka.siv.repository;

import com.beraka.siv.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    //"SELECT COUNT(*) FROM product WHERE category_id = ?"
    long countByCategoryId(Long categoryId);

    boolean existsBySku(String sku);
}
