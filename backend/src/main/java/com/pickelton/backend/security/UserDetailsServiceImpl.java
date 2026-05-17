package com.pickelton.backend.security;

import java.util.Collections;

import com.pickelton.backend.user.entity.User;
import com.pickelton.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getId().toString())
            .password(user.getPassword())
            .authorities(Collections.emptyList())
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
