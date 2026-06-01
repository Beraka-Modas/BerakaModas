package com.beraka.siv.config;

import com.beraka.siv.model.entity.Branch;
import com.beraka.siv.model.entity.User;
import com.beraka.siv.repository.UserRepository;
import com.beraka.siv.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.boot.CommandLineRunner;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) {
        try {
            return config.getAuthenticationManager();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CommandLineRunner seedData(PasswordEncoder passwordEncoder) {
        return args -> {
            if (branchRepository.count() == 0) {
                Branch central = new Branch(null, "Sede Central", "Dirección principal", "1");
                Branch norte = new Branch(null, "Sucursal Norte", "Dirección sucursal norte", "2");
                branchRepository.save(central);
                branchRepository.save(norte);
            }

            if (userRepository.findByUsername("admin_beraka").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin_beraka");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(User.Role.ADMIN);
                userRepository.save(admin);
            }

            if (userRepository.findByUsername("vendedor_beraka").isEmpty()) {
                User seller = new User();
                seller.setUsername("vendedor_beraka");
                seller.setPassword(passwordEncoder.encode("vendedor123"));
                seller.setRole(User.Role.VENDEDOR);
                userRepository.save(seller);
            }
        };
    }
}