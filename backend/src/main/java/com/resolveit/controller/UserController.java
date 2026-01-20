package com.resolveit.controller;

import com.resolveit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<java.util.Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", user.getId());
            map.put("name", user.getFullName());
            map.put("email", user.getEmail());
            map.put("role", user.getRole().name());
            return map;
        }).collect(Collectors.toList());
    }
}
