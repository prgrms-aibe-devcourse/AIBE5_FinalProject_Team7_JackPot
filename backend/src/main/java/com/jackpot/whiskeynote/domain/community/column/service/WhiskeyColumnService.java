// 위스키 칼럼 등록·조회 비즈니스 로직을 담당하는 서비스 레이어
package com.jackpot.whiskeynote.domain.community.column.service;

import com.jackpot.whiskeynote.domain.community.column.dto.WhiskeyColumnRequest;
import com.jackpot.whiskeynote.domain.community.column.dto.WhiskeyColumnResponse;
import com.jackpot.whiskeynote.domain.community.column.entity.WhiskeyColumn;
import com.jackpot.whiskeynote.domain.community.column.repository.WhiskeyColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class WhiskeyColumnService {

    private final WhiskeyColumnRepository columnRepository;

    // 중복 저장 방지 로직(url 중복 체크 등)이 없는 이유:
    // 현재 칼럼은 관리자 또는 신뢰된 배치 스크립트가 직접 입력하므로
    // 애플리케이션 레벨의 중복 검사 대신 운영 절차로 관리한다.
    // 향후 자동 크롤러가 주기적으로 수집할 경우 url unique 제약 및 upsert 로직 추가 필요.
    @Transactional
    public WhiskeyColumnResponse save(WhiskeyColumnRequest req) {
        WhiskeyColumn col = WhiskeyColumn.create(
                req.sourceType(),
                req.title(),
                req.url(),
                req.thumbnailUrl(),
                req.description(),
                req.whiskeyKeyword(),
                req.publishedAt()
        );
        return WhiskeyColumnResponse.from(columnRepository.save(col));
    }

    // readOnly = true: 쓰기 작업이 없는 조회 트랜잭션임을 명시.
    // Hibernate는 이 힌트를 받아 dirty checking(변경 감지) 스냅샷을 생성하지 않으므로
    // 메모리 사용량과 flush 비용을 줄일 수 있다.
    @Transactional(readOnly = true)
    public WhiskeyColumnResponse getColumn(Long id) {
        // NoSuchElementException을 사용하는 이유:
        // 별도의 커스텀 예외 계층이 아직 없는 상태에서 표준 JDK 예외를 활용한다.
        // GlobalExceptionHandler에서 이 예외를 HTTP 404로 매핑하도록 처리해야 한다.
        return columnRepository.findById(id)
                .map(WhiskeyColumnResponse::from)
                .orElseThrow(() -> new NoSuchElementException("Column not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<WhiskeyColumnResponse> getColumns(int page, int size) {
        return columnRepository.findAllByOrderByPublishedAtDescCreatedAtDesc(PageRequest.of(page, size))
                .map(WhiskeyColumnResponse::from);
    }

    @Transactional(readOnly = true)
    public List<WhiskeyColumnResponse> getRelatedColumns(String whiskeyName) {
        return columnRepository
                .findTop5ByWhiskeyKeywordContainingIgnoreCaseOrderByPublishedAtDesc(whiskeyName)
                .stream()
                .map(WhiskeyColumnResponse::from)
                .toList();
    }
}
