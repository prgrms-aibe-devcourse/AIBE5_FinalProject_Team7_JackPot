package com.jackpot.whiskeynote.domain.whiskey.search;

import com.jackpot.whiskeynote.domain.whiskey.search.service.WhiskeySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
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
}
