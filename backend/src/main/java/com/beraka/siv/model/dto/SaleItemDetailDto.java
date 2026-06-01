package com.beraka.siv.model.dto;

import java.io.Serializable;
import java.math.BigDecimal;

public class SaleItemDetailDto implements Serializable {
    private String productName;
    private String size;
    private Integer quantity;
    private BigDecimal unitPrice;

    public SaleItemDetailDto() {
    }

    public SaleItemDetailDto(String productName, String size, Integer quantity, BigDecimal unitPrice) {
        this.productName = productName;
        this.size = size;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}

