package com.resolveit.controller;

import com.resolveit.dto.LoginRequest;
import com.resolveit.dto.RegisterRequest;
import com.resolveit.model.User;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            return "Email already registered";
        }
        User u = new User();
        u.setFullName(req.getName());
        u.setName(req.getName());
        u.setUsername(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));

        // Handle role
        User.Role role = User.Role.USER;
        if (req.getRole() != null) {
            try {
                role = User.Role.valueOf(req.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Keep default USER role if invalid role provided
            }
        }
        u.setRole(role);

        userRepository.save(u);
        return "Registered Successfully";
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        Map<String, Object> res = new HashMap<>();
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);

        if (user == null) {
            res.put("status", "error");
            res.put("message", "Invalid Email");
            return res;
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            res.put("status", "error");
            res.put("message", "Invalid Password");
            return res;
        }

        // AUTO-FIX: Ensure admin@test.com has ADMIN role
        if ("admin@test.com".equalsIgnoreCase(user.getEmail()) && user.getRole() == User.Role.USER) {
            System.out.println("Auto-fixing role for admin@test.com to ADMIN");
            user.setRole(User.Role.ADMIN);
            userRepository.save(user);
        }

        // Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        // Send token & user details
        res.put("status", "success");
        res.put("token", token);
        res.put("user", Map.of(
                "id", user.getId(),
                "name", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name()));
        return res;
    }
}
