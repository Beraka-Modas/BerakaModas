package com.beraka.siv.service;

import com.beraka.siv.model.dto.StockAdjustRequest;
import com.beraka.siv.model.dto.StockDto;
import com.beraka.siv.model.dto.StockEntryRequest;
import com.beraka.siv.model.entity.*;
import com.beraka.siv.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final InventoryLogRepository logRepository;
    private final UserRepository userRepository;

    // RF-10: Ingreso de Mercancía
    @Transactional // (RNF-06: Todo o nada, si falla el log, no se guarda el stock)
    public StockDto addStock(StockEntryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Error: Producto no encontrado con ese ID"));

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Error: Sede no encontrada con ese ID"));

        // Buscamos si ya hay stock de esta talla. Si no hay, creamos un registro nuevo en 0.
        Stock stock = stockRepository.findByProductIdAndBranchIdAndSize(
                request.getProductId(), request.getBranchId(), request.getSize()
        ).orElseGet(() -> {
            Stock newStock = new Stock();
            newStock.setProduct(product);
            newStock.setBranch(branch);
            newStock.setSize(request.getSize());
            newStock.setQuantity(0);
            return newStock;
        });

        // Sumamos la nueva cantidad
        stock.setQuantity(stock.getQuantity() + request.getQuantity());
        Stock savedStock = stockRepository.save(stock);

        // RF-09: Guardamos en el Kardex (Auditoría)
        saveLog(product, "ENTRADA", request.getQuantity(), "Ingreso por abastecimiento");

        return new StockDto(savedStock.getId(), branch.getName(), savedStock.getSize(), savedStock.getQuantity());
    }

    // RF-11: Ajuste Manual (Corregir errores)
    @Transactional
    public StockDto adjustStock(StockAdjustRequest request) {
        if (request.getReason() == null || request.getReason().length() < 10) {
            throw new IllegalArgumentException("La justificación es obligatoria y debe tener al menos 10 caracteres.");
        }

        Stock stock = stockRepository.findByProductIdAndBranchIdAndSize(
                request.getProductId(), request.getBranchId(), request.getSize()
        ).orElseThrow(() -> new RuntimeException("No existe stock registrado para ajustar."));

        int oldQuantity = stock.getQuantity();
        int difference = request.getNewQuantity() - oldQuantity; // Calculamos si sobró o faltó

        stock.setQuantity(request.getNewQuantity());
        Stock savedStock = stockRepository.save(stock);

        // Guardamos en el Kardex el motivo exacto escrito por el Admin
        saveLog(stock.getProduct(), "AJUSTE", difference, request.getReason());

        return new StockDto(savedStock.getId(), stock.getBranch().getName(), savedStock.getSize(), savedStock.getQuantity());
    }

    // RF-08: Consultar dónde está el producto
    public List<StockDto> getStockByProduct(Long productId) {
        return stockRepository.findByProductId(productId).stream()
                .map(s -> new StockDto(s.getId(), s.getBranch().getName(), s.getSize(), s.getQuantity()))
                .collect(Collectors.toList());
    }

    // --- Método Privado para Auditoría ---
    private void saveLog(Product product, String type, Integer qtyChange, String reason) {
        // Obtenemos quién es el usuario que está haciendo la petición ahora mismo
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();

        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setUser(currentUser);
        log.setMovementType(type);
        log.setQuantityChange(qtyChange);
        log.setReason(reason);

        logRepository.save(log);
    }
}