package com.beraka.siv.model.dto;

import com.beraka.siv.model.entity.User.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private Role role; // ADMIN o VENDEDOR
}