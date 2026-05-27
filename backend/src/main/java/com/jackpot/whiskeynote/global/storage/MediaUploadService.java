package com.jackpot.whiskeynote.global.storage;

import com.jackpot.whiskeynote.global.storage.dto.PresignUploadRequest;
import com.jackpot.whiskeynote.global.storage.dto.PresignUploadResponse;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class MediaUploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    /** API presign 업로드: whiskeys/ · S3 콘솔 수동 업로드: whiskey/ */
    private static final Set<String> ALLOWED_PREFIXES = Set.of(
            MediaPurpose.WHISKEY.prefix() + "/",
            "whiskey/",
            MediaPurpose.POST.prefix() + "/",
            MediaPurpose.PROFILE.prefix() + "/"
    );

    private final S3Properties s3Properties;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public PresignUploadResponse createPresignedUpload(Long userId, PresignUploadRequest request) {
        ensureConfigured();

        String contentType = request.contentType().trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다.");
        }

        String extension = resolveExtension(contentType, request.fileName());
        String objectKey = "%s/%d/%s.%s".formatted(
                request.purpose().prefix(),
                userId,
                UUID.randomUUID(),
                extension
        );

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(objectKey)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(s3Properties.presignDurationMinutes()))
                .putObjectRequest(putObjectRequest)
                .build();

        String uploadUrl = s3Presigner.presignPutObject(presignRequest).url().toExternalForm();
        String mediaUrl = "/api/v1/media?key=" + objectKey;

        return new PresignUploadResponse(uploadUrl, objectKey, mediaUrl);
    }

    public MediaObject loadObject(String key) {
        ensureConfigured();
        validateObjectKey(key);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .build();

        ResponseInputStream<GetObjectResponse> stream = s3Client.getObject(getObjectRequest);
        GetObjectResponse response = stream.response();
        String contentType = response.contentType() != null ? response.contentType() : "application/octet-stream";

        return new MediaObject(stream, contentType, response.contentLength());
    }

    private void ensureConfigured() {
        if (!s3Properties.isConfigured()) {
            throw new IllegalStateException("S3 버킷이 설정되지 않았습니다.");
        }
    }

    static void validateObjectKey(String key) {
        if (key == null || key.isBlank() || key.contains("..") || key.startsWith("/")) {
            throw new IllegalArgumentException("유효하지 않은 객체 키입니다.");
        }

        boolean allowed = ALLOWED_PREFIXES.stream().anyMatch(key::startsWith);
        if (!allowed) {
            throw new IllegalArgumentException("허용되지 않은 경로입니다.");
        }
    }

    /** 프로필 이미지는 본인 profiles/{userId}/ 경로만 허용 */
    public static void validateProfileObjectKeyForUser(Long userId, String key) {
        validateObjectKey(key);
        String expectedPrefix = MediaPurpose.PROFILE.prefix() + "/" + userId + "/";
        if (!key.startsWith(expectedPrefix)) {
            throw new IllegalArgumentException("본인 프로필 이미지 경로만 등록할 수 있습니다.");
        }
    }

    private static String resolveExtension(String contentType, String fileName) {
        if (fileName != null && fileName.contains(".")) {
            String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (Set.of("jpg", "jpeg", "png", "webp", "gif").contains(ext)) {
                return ext.equals("jpeg") ? "jpg" : ext;
            }
        }

        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
    }

    public record MediaObject(
            ResponseInputStream<GetObjectResponse> stream,
            String contentType,
            Long contentLength
    ) {}
}
