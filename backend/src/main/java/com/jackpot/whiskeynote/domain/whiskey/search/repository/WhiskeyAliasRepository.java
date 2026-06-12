package com.jackpot.whiskeynote.domain.whiskey.search.repository;

import com.jackpot.whiskeynote.domain.whiskey.search.entity.WhiskeyAlias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhiskeyAliasRepository extends JpaRepository<WhiskeyAlias,Long> {
    // 위스키 ID 목록으로 별칭 조회 - 검색 결과에 포함된 위스키들의 별칭을 한 번에 조회하여 Elasticsearch 인덱싱 시 활용
    List<WhiskeyAlias> findByWhiskeyIdIn(List<Long> whiskeyIds);
    // 특정 위스키 ID로 별칭 조회 - 단일 위스키의 상세 정보 조회 시 해당 위스키의 별칭을 함께 조회하여 반환할 때 활용
    List<WhiskeyAlias> findByWhiskeyId(Long whiskeyId);
}
