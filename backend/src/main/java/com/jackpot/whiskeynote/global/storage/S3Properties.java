package com.jackpot.whiskeynote.global.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.s3")
public record S3Properties(
        String region,
        String bucket,
        int presignDurationMinutes,
        long maxSizeBytes
) {
    public boolean isConfigured() {
        return bucket != null && !bucket.isBlank();
    }
}
