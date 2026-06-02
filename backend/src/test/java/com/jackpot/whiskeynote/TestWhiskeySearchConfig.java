package com.jackpot.whiskeynote;

import com.jackpot.whiskeynote.domain.whiskey.search.dto.WhiskeyKeywordCorrectionResponse;
import com.jackpot.whiskeynote.domain.whiskey.search.service.WhiskeySearchService;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@Configuration
@Profile("test")
public class TestWhiskeySearchConfig {

    /*
     * CI/test 환경에는 Elasticsearch 컨테이너가 없을 수 있다.
     * 검색 기능 자체를 검증하지 않는 테스트에서는 외부 ES 연결 없이 Spring Context가 뜨도록
     * WhiskeySearchService를 테스트용 mock으로 대체한다.
     */
    @Bean
    public WhiskeySearchService whiskeySearchService() {
        WhiskeySearchService service = Mockito.mock(WhiskeySearchService.class);

        when(service.searchByKeyword(anyString(), anyInt(), anyInt()))
                .thenReturn(Page.empty());
        when(service.autocompleteKeyword(anyString(), anyInt()))
                .thenReturn(List.of());
        when(service.correctKeyword(anyString()))
                .thenAnswer(invocation -> WhiskeyKeywordCorrectionResponse.empty(invocation.getArgument(0)));

        return service;
    }
}
