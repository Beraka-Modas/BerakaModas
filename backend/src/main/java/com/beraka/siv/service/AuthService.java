package com.beraka.siv.service;

import com.beraka.siv.config.JwtService;
import com.beraka.siv.model.dto.AuthResponse;
import com.beraka.siv.model.dto.LoginRequest;
import com.beraka.siv.model.dto.RegisterRequest;
import com.beraka.siv.model.entity.User;
import com.beraka.siv.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        // 1. Spring Security verifica si el usuario y contraseña coinciden en la BD
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. Si pasa, buscamos al usuario para generarle su token
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    public AuthResponse register(RegisterRequest request) {
        // 1. Creamos el usuario y encriptamos su contraseña (RNF-05)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        // 2. Lo guardamos en la base de datos
        userRepository.save(user);

        // 3. Le generamos un token para que ya entre logueado
        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }
}