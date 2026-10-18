package com.pickelton.backend.mapper;

import com.pickelton.backend.user.dto.PublicUserSummary;
import com.pickelton.backend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public PublicUserSummary toPublicSummary(User user) {
        return new PublicUserSummary(
            user.getId(),
            user.getName(),
            user.getAvatarUrl(),
            user.getCity()
        );
    }
}
