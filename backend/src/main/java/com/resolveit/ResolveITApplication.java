package com.resolveit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Main Application Class for ResolveIT Grievance Portal
 * 
 * @author ResolveIT Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class ResolveITApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResolveITApplication.class, args);
        System.out.println("=================================================");
        System.out.println("ResolveIT Grievance Portal Started Successfully!");
        System.out.println("Server running on: http://localhost:8080/api");
        System.out.println("=================================================");
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
