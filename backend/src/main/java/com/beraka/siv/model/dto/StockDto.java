package com.beraka.siv.model.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StockDto {
    private Long id;
    private String branchName;
    private String size;
    private Integer quantity;
}