package com.beraka.siv.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp; // Cuándo ocurrió el error
    private int status;              // Código HTTP (400, 404, 500)
    private String error;            // Título del error
    private String message;          // El mensaje amigable para el usuario
}