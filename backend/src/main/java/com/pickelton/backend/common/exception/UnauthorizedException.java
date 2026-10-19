package com.pickelton.backend.common.exception;

// 401: not signed in, or the session (refresh token) is no longer valid. Clients log the user out on this.
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
