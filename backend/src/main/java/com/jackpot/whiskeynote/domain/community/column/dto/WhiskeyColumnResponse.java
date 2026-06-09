// 위스키 칼럼 조회 결과를 클라이언트에 반환하는 응답 DTO
package com.jackpot.whiskeynote.domain.community.column.dto;

import com.jackpot.whiskeynote.domain.community.column.entity.ColumnSourceType;
import com.jackpot.whiskeynote.domain.community.column.entity.WhiskeyColumn;

import java.time.LocalDateTime;

/**
 * 위스키 칼럼 응답 DTO.
 *
 * <p><b>엔티티와 DTO를 분리하는 이유:</b> 엔티티를 직접 직렬화하면 JPA 프록시 객체나
 * 양방향 연관관계로 인한 무한 순환 참조, 불필요한 필드 노출 등의 문제가 생깁니다.
 * DTO를 별도로 두면 API 응답 형태를 엔티티 구조와 독립적으로 변경할 수 있습니다.</p>
 *
 * <p><b>from() 팩토리를 DTO 내부에 두는 이유:</b> 변환 책임을 서비스나 매퍼 클래스에 분산하지 않고
 * DTO 자신이 "어떤 필드로 구성되는지"를 알도록 응집도를 높이기 위함입니다.
 * 서비스 레이어는 {@code WhiskeyColumnResponse.from(col)}만 호출하면 되므로 변환 코드가
 * 한 곳에서 관리됩니다.</p>
 */
public record WhiskeyColumnResponse(
        Long id,
        ColumnSourceType sourceType,
        String title,
        String url,
        String thumbnailUrl,
        String description,
        String whiskeyKeyword,
        String author,
        String sourceName,
        LocalDateTime publishedAt,
        LocalDateTime createdAt
) {
    public static WhiskeyColumnResponse from(WhiskeyColumn col) {
        return new WhiskeyColumnResponse(
                col.getId(),
                col.getSourceType(),
                col.getTitle(),
                col.getUrl(),
                col.getThumbnailUrl(),
                col.getDescription(),
                col.getWhiskeyKeyword(),
                col.getAuthor(),
                col.getSourceName(),
                col.getPublishedAt(),
                col.getCreatedAt()
        );
    }
}
