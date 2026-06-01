package com.beraka.siv.service;

import com.beraka.siv.model.dto.CategoryDto;
import com.beraka.siv.model.entity.Category;
import com.beraka.siv.repository.CategoryRepository;
import com.beraka.siv.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryDto createCategory(CategoryDto dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        Category saved = categoryRepository.save(category);

        dto.setId(saved.getId());
        return dto;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(cat ->
                new CategoryDto(cat.getId(), cat.getName(), cat.getDescription())
        ).collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            category.setName(dto.getName().trim());
        }

        if (dto.getDescription() != null) {
            category.setDescription(dto.getDescription());
        }

        Category saved = categoryRepository.save(category);
        return new CategoryDto(saved.getId(), saved.getName(), saved.getDescription());
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));

        long productsUsingCategory = productRepository.countByCategoryId(id);
        if (productsUsingCategory > 0) {
            throw new RuntimeException("No se puede eliminar la categoría porque tiene productos asociados");
        }

        categoryRepository.delete(category);
    }
}