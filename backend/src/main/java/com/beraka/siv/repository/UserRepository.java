package com.beraka.siv.repository;

import com.beraka.siv.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Boot crea la consulta SQL automáticamente solo con leer el nombre del método:
    Optional<User> findByUsername(String username);
}