package com.beraka.siv.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir archivos desde la carpeta uploads/products/
        String uploadDir = Paths.get("uploads/products").toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadDir);
    }
}

