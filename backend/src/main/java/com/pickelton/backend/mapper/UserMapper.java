package com.pickelton.backend.mapper;

import com.pickelton.backend.user.dto.UserResponse;
import com.pickelton.backend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getSportType(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}