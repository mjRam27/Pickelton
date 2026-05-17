package com.pickelton.backend.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MdcLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
        try {
            MDC.put("traceId", UUID.randomUUID().toString());
            if (request instanceof HttpServletRequest http) {
                MDC.put("method", http.getMethod());
                MDC.put("path", http.getRequestURI());
            }
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
