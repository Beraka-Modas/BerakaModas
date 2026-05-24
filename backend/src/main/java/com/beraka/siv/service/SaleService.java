package com.beraka.siv.service;

import com.beraka.siv.model.dto.*;
import com.beraka.siv.model.entity.*;
import com.beraka.siv.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final InventoryLogRepository logRepository; // Reutilizamos el Kardex

    @Transactional // RNF-06: Todo o nada (ACID)
    public SaleResponse processSale(SaleRequest request) {

        // 1. Validar quién hace la venta y en qué local
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User seller = userRepository.findByUsername(currentUsername).orElseThrow();
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Sede no encontrada"));

        // 2. Preparamos la Venta (Encabezado)
        Sale sale = new Sale();
        sale.setBranch(branch);
        sale.setUser(seller);
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setStatus("ACTIVA");

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<SaleItem> itemsToSave = new ArrayList<>();

        // 3. Procesar cada producto del carrito
        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemReq.getProductId()));

            // Buscar el stock exacto por local y talla
            Stock stock = stockRepository.findByProductIdAndBranchIdAndSize(
                    product.getId(), branch.getId(), itemReq.getSize()
            ).orElseThrow(() -> new RuntimeException("No hay inventario de la talla " + itemReq.getSize() + " para " + product.getName()));

            // Validar que alcance la cantidad
            if (stock.getQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName() + " Talla: " + itemReq.getSize());
            }

            // Descontar inventario
            stock.setQuantity(stock.getQuantity() - itemReq.getQuantity());
            stockRepository.save(stock); // Guarda el nuevo stock

            // Auditoría (Kardex)
            saveLog(product, seller, "VENTA", -itemReq.getQuantity(), "Venta POS");

            // Crear el detalle de venta
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setUnitPrice(product.getPrice()); // Tomamos el precio del catálogo

            itemsToSave.add(saleItem);

            // Calcular total: Precio * Cantidad (RF-17)
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            grandTotal = grandTotal.add(itemTotal);
        }

        // 4. Guardar todo
        sale.setTotal(grandTotal);
        Sale savedSale = saleRepository.save(sale); // Guarda factura
        saleItemRepository.saveAll(itemsToSave);    // Guarda detalles

        // 5. Devolver la respuesta para el Ticket
        SaleResponse response = new SaleResponse();
        response.setSaleId(savedSale.getId());
        response.setDate(savedSale.getCreatedAt());
        response.setTotal(savedSale.getTotal());
        response.setPaymentMethod(savedSale.getPaymentMethod());
        response.setStatus(savedSale.getStatus());
        response.setBranchName(branch.getName());
        response.setSellerName(seller.getUsername());

        return response;
    }

    // Método auxiliar para el Kardex
    private void saveLog(Product product, User user, String type, Integer qtyChange, String reason) {
        InventoryLog log = new InventoryLog();
        log.setProduct(product);
        log.setUser(user);
        log.setMovementType(type);
        log.setQuantityChange(qtyChange);
        log.setReason(reason);
        logRepository.save(log);
    }
}