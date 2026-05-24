package com.beraka.siv.service;

import com.beraka.siv.model.dto.CategoryDto;
import com.beraka.siv.model.entity.Category;
import com.beraka.siv.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

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
}