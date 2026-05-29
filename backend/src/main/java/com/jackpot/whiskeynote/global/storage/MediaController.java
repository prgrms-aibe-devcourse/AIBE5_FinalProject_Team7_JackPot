package com.jackpot.whiskeynote.global.storage;

import com.jackpot.whiskeynote.global.response.ApiResponse;
import com.jackpot.whiskeynote.global.security.JwtUserPrincipal;
import com.jackpot.whiskeynote.global.storage.dto.PresignUploadRequest;
import com.jackpot.whiskeynote.global.storage.dto.PresignUploadResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUploadService mediaUploadService;

    /**
     * 브라우저 → S3 직접 PUT 전 presigned URL 발급 (로그인 필요).
     */
    @PostMapping("/uploads/presign")
    public ApiResponse<PresignUploadResponse> presignUpload(
            @AuthenticationPrincipal JwtUserPrincipal principal,
            @Valid @RequestBody PresignUploadRequest request
    ) {
        return ApiResponse.ok(mediaUploadService.createPresignedUpload(principal.userId(), request));
    }

    /**
     * 비공개 S3 객체를 API 경유로 조회 (img src 용).
     */
    @GetMapping("/media")
    public ResponseEntity<InputStreamResource> getMedia(@RequestParam("key") String key) {
        try {
            MediaUploadService.MediaObject media = mediaUploadService.loadObject(key);

            ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .contentType(MediaType.parseMediaType(media.contentType()));

            if (media.contentLength() != null) {
                builder.contentLength(media.contentLength());
            }

            return builder.body(new InputStreamResource(media.stream()));
        } catch (NoSuchKeyException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
