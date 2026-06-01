package com.beraka.siv.model.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SaleDetailDto implements Serializable {
    private Long saleId;
    private LocalDateTime date;
    private BigDecimal total;
    private String paymentMethod;
    private String status;
    private String branchName;
    private String sellerName;
    private List<SaleItemDetailDto> items;

    public SaleDetailDto() {
    }

    public SaleDetailDto(Long saleId, LocalDateTime date, BigDecimal total, String paymentMethod, String status, String branchName, String sellerName) {
        this.saleId = saleId;
        this.date = date;
        this.total = total;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.branchName = branchName;
        this.sellerName = sellerName;
    }

    // Getters y Setters
    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public List<SaleItemDetailDto> getItems() {
        return items;
    }

    public void setItems(List<SaleItemDetailDto> items) {
        this.items = items;
    }
}


