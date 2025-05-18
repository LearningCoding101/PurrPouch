// filepath: d:\projects\purr_pouch\Backend\src\main\java\com\purrpouch\backend\controller\AuthController.java
package com.purrpouch.backend.controller;

import com.purrpouch.backend.model.User;
import com.purrpouch.backend.payload.request.RoleUpdateRequest;
import com.purrpouch.backend.payload.response.MessageResponse;
import com.purrpouch.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfo() {
        // The user is already authenticated by the Firebase filter
        // Principal is set in the SecurityContext
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@RequestBody RoleUpdateRequest roleUpdateRequest) {
        Optional<User> userOptional = userRepository.findById(roleUpdateRequest.getUserId());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            switch (roleUpdateRequest.getRole().toLowerCase()) {
                case "admin":
                    user.setRole(User.Role.ADMIN);
                    break;
                case "staff":
                    user.setRole(User.Role.STAFF);
                    break;
                default:
                    user.setRole(User.Role.USER);
                    break;
            }

            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User role updated successfully"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
    }
}


