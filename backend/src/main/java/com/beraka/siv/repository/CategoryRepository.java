package com.beraka.siv.repository;
import com.beraka.siv.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoryRepository extends JpaRepository<Category, Long> {}