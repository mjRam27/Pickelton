package com.pickelton.backend.auth.service;

import java.util.Map;

import com.pickelton.backend.common.exception.BadRequestException;
import com.pickelton.backend.common.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

// Sends and checks SMS codes through Twilio Verify. Twilio generates the code, so we never store it.
// Not configured (no TWILIO_* settings) means VerificationCodeService falls back to its local code.
@Slf4j
@Component
public class TwilioVerifyClient {

    private final String serviceSid;
    private final String defaultCountryCode;
    private final RestClient restClient;

    public TwilioVerifyClient(
        @Value("${twilio.account-sid:}") String accountSid,
        @Value("${twilio.auth-token:}") String authToken,
        @Value("${twilio.verify-service-sid:}") String serviceSid,
        @Value("${otp.default-country-code:+91}") String defaultCountryCode
    ) {
        this.serviceSid = serviceSid;
        this.defaultCountryCode = defaultCountryCode;
        this.restClient = accountSid.isBlank() || authToken.isBlank() ? null : RestClient.builder()
            .baseUrl("https://verify.twilio.com/v2/Services/" + serviceSid)
            .defaultHeaders(headers -> headers.setBasicAuth(accountSid, authToken))
            .build();
    }

    public boolean isConfigured() {
        return restClient != null && !serviceSid.isBlank();
    }

    public void sendCode(String phoneNumber) {
        post("/Verifications", Map.of("To", toE164(phoneNumber), "Channel", "sms"));
    }

    public boolean checkCode(String phoneNumber, String code) {
        try {
            Map<?, ?> result = post("/VerificationCheck", Map.of("To", toE164(phoneNumber), "Code", code));
            return result != null && "approved".equals(result.get("status"));
        } catch (BadRequestException ex) {
            // Twilio answers 404 when there's no pending code (expired, used, or never sent).
            return false;
        }
    }

    // Phone numbers are stored as typed; Twilio needs +<country><number>. Ten digits means an Indian mobile.
    String toE164(String phoneNumber) {
        String digits = phoneNumber.replaceAll("[^0-9+]", "");
        if (digits.startsWith("+")) {
            return digits;
        }
        if (digits.length() == 10) {
            return defaultCountryCode + digits;
        }
        return "+" + digits;
    }

    private Map<?, ?> post(String path, Map<String, String> fields) {
        var form = new LinkedMultiValueMap<String, String>();
        fields.forEach(form::add);
        try {
            return restClient.post().uri(path).contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
                .retrieve().body(Map.class);
        } catch (HttpClientErrorException ex) {
            HttpStatusCode status = ex.getStatusCode();
            log.warn("Twilio Verify rejected request status={} body={}", status.value(), ex.getResponseBodyAsString());
            if (status.value() == 429) {
                throw new BadRequestException("Too many verification attempts. Try again in a few minutes");
            }
            if (status.value() == 404) {
                throw new BadRequestException("Verification code expired or not requested");
            }
            throw new BadRequestException("This phone number can't receive verification codes. Check it on your profile");
        } catch (RestClientException ex) {
            log.warn("Twilio Verify unreachable: {}", ex.getMessage());
            throw new ServiceUnavailableException("Phone verification service unavailable");
        }
    }
}
