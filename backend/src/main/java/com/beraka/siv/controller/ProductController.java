package com.beraka.siv.controller;

import com.beraka.siv.model.dto.ProductDto;
import com.beraka.siv.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDto>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProductDto> createWithImage(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String price,
            @RequestParam Long categoryId,
            @RequestParam Integer minStock,
            @RequestParam(required = false) MultipartFile image) {

        ProductDto productDto = new ProductDto();
        productDto.setName(name);
        productDto.setDescription(description);
        productDto.setPrice(new java.math.BigDecimal(price));
        productDto.setCategoryId(categoryId);
        productDto.setMinStock(minStock);

        // Si hay imagen, guardarla y obtener la URL
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = productService.saveProductImage(image);
                productDto.setImageUrl(imageUrl);
            } catch (Exception e) {
                // Si falla la imagen, continuar sin ella
                productDto.setImageUrl(null);
            }
        }

        return ResponseEntity.ok(productService.createProduct(productDto));
    }
}