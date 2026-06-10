// 관리자(또는 크롤러 배치)가 칼럼을 등록할 때 사용하는 요청 DTO
package com.jackpot.whiskeynote.domain.community.column.dto;

import com.jackpot.whiskeynote.domain.community.column.entity.ColumnSourceType;

import java.time.LocalDateTime;

/**
 * 위스키 칼럼 등록 요청 DTO.
 *
 * <p><b>Bean Validation(@NotNull 등) 미적용 이유:</b> 이 엔드포인트는 외부 사용자가 아닌
 * 관리자 또는 신뢰된 크롤러 배치만 호출합니다. SecurityConfig에서 {@code /api/v1/admin/**}
 * 경로에 ADMIN 권한을 일괄 적용하므로 입력값 검증보다 인가 계층이 더 중요한 방어선입니다.
 * 향후 외부 API로 확장할 경우 @Validated와 함께 검증 애노테이션을 추가해야 합니다.</p>
 *
 * <p><b>author·sourceName 미포함 이유:</b> 두 필드는 크롤러가 파싱에 성공했을 때만 얻을 수 있어
 * 항상 제공되지 않습니다. 엔티티 레벨에서 nullable로 허용하고 배치 스크립트에서 별도로
 * 설정하는 방식을 택해 API 계약을 단순하게 유지합니다.</p>
 */
public record WhiskeyColumnRequest(
        ColumnSourceType sourceType,
        String title,
        String url,
        String thumbnailUrl,
        String description,
        String whiskeyKeyword,
        LocalDateTime publishedAt
) {}
