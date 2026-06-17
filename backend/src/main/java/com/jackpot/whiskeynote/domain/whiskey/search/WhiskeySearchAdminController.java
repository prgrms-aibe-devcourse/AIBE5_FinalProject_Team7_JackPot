package com.jackpot.whiskeynote.domain.whiskey.search;

import com.jackpot.whiskeynote.domain.whiskey.search.service.WhiskeySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("!test")
@RequiredArgsConstructor
public class WhiskeySearchAdminController {

    private final WhiskeySearchService whiskeySearchService;

    @PostMapping("/api/v1/admin/whiskeys/search/reindex")
    public String reindexAllWhiskeys() {
        whiskeySearchService.reindexAll();
        return "위스키 검색 인덱스 재생성이 완료되었습니다.";
    }

    @PostMapping("/api/v1/admin/whiskeys/search/reindex/{indexName}")
    public String reindexAllWhiskeysToIndex(@PathVariable String indexName) {
        // 운영에서 edge_ngram 같은 새 매핑을 적용할 때 사용하는 엔드포인트.
        // 예: whiskeys_v2 인덱스를 먼저 생성한 뒤 이 API로 해당 인덱스에 직접 색인한다.
        // 색인이 끝난 후 Elasticsearch alias를 새 인덱스로 전환하면 기존 검색 인덱스를 바로 지우지 않아도 된다.
        whiskeySearchService.reindexAllTo(indexName);
        return "위스키 검색 인덱스 재생성이 완료되었습니다. targetIndex=" + indexName;
    }
}
