// 위스키 칼럼 데이터 접근 레이어 — 목록 조회 및 키워드 기반 연관 칼럼 검색
package com.jackpot.whiskeynote.domain.community.column.repository;

import com.jackpot.whiskeynote.domain.community.column.entity.WhiskeyColumn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhiskeyColumnRepository extends JpaRepository<WhiskeyColumn, Long> {

    // publishedAt DESC를 우선 정렬 기준으로 사용하는 이유:
    // createdAt은 DB 삽입 순서를 반영하므로 과거에 발행된 글도 최근에 수집되면 상단에 뜰 수 있다.
    // 실제 발행일 기준으로 정렬해야 이용자가 최신 콘텐츠를 먼저 보게 되며,
    // publishedAt이 동일한 경우(null 포함)에는 createdAt으로 보조 정렬한다.
    Page<WhiskeyColumn> findAllByOrderByPublishedAtDescCreatedAtDesc(Pageable pageable);

    // 위스키 상세 페이지에서 "관련 칼럼" 사이드바에 노출하는 용도.
    // 5개로 제한하는 이유: UI 공간 제약 및 불필요한 데이터 로드 방지.
    // 키워드 대소문자를 무시(IgnoreCase)하는 이유: 사용자가 입력한 위스키 이름과
    // 크롤러가 저장한 키워드의 표기가 다를 수 있기 때문이다.
    List<WhiskeyColumn> findTop5ByWhiskeyKeywordContainingIgnoreCaseOrderByPublishedAtDesc(String keyword);
}
