package com.beraka.siv.service;

import com.beraka.siv.model.dto.ProductDto;
import com.beraka.siv.model.entity.Category;
import com.beraka.siv.model.entity.Product;
import com.beraka.siv.repository.CategoryRepository;
import com.beraka.siv.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // Carpeta donde se guardan las imágenes
    private static final String UPLOAD_DIR = "uploads/products/";

    public ProductDto createProduct(ProductDto dto) {
        // 1. Validar que la categoría exista (RF-05)
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        // 2. Generar el SKU Automático (RF-01)
        String sku = generateSku(category);

        // 3. Mapear y guardar el Producto
        Product product = new Product();
        product.setSku(sku);
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setMinStock(dto.getMinStock() != null ? dto.getMinStock() : 0);
        // Si no hay imageUrl, usar placeholder por defecto
        String imageUrl = dto.getImageUrl();
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            imageUrl = "/placeholder.jpg";
        }
        product.setImageUrl(imageUrl);
        product.setCategory(category);

        Product saved = productRepository.save(product);

        // 4. Devolver el DTO actualizado
        return mapToDto(saved);
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // --- Métodos Privados Auxiliares ---

    private String generateSku(Category category) {
        // Obtener las primeras 3 letras de la categoría (en mayúsculas)
        String catName = category.getName().toUpperCase();
        String prefix = catName.length() >= 3 ? catName.substring(0, 3) : catName;

        // Contar cuántos productos hay en esta categoría y sumar 1 para el consecutivo
        long count = productRepository.countByCategoryId(category.getId()) + 1;

        // Obtener el año actual
        String currentYear = String.valueOf(Year.now().getValue());

        // Formato final: PREFIJO - CONSECUTIVO(3 dígitos) - AÑO (Ej: BLU-001-2026)
        return String.format("%s-%03d-%s", prefix, count, currentYear);
    }

    private ProductDto mapToDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getMinStock(),
                p.getImageUrl(),
                p.getCategory().getId(),
                p.getCategory().getName()
        );
    }

    // Método para guardar imagen de producto
    public String saveProductImage(MultipartFile file) throws IOException {
        // Crear directorio si no existe
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para la imagen
        String originalName = file.getOriginalFilename();
        String extension = originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
        String newFileName = UUID.randomUUID() + extension;

        // Guardar el archivo
        Path filePath = uploadPath.resolve(newFileName);
        Files.copy(file.getInputStream(), filePath);

        // Retornar la URL relativa de la imagen
        return "/uploads/products/" + newFileName;
    }
}