package com.jackpot.whiskeynote.domain.whiskey.service;

import com.jackpot.whiskeynote.domain.whiskey.dto.*;
import com.jackpot.whiskeynote.domain.whiskey.entity.AvgWhiskeyTag;
import com.jackpot.whiskeynote.domain.whiskey.entity.Whiskey;
import com.jackpot.whiskeynote.domain.whiskey.entity.WhiskeysNoteCache;
import com.jackpot.whiskeynote.domain.whiskey.repository.AvgWhiskeyTagRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeyRepository;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeySpecification;
import com.jackpot.whiskeynote.domain.whiskey.repository.WhiskeysNoteCacheRepository;
import com.jackpot.whiskeynote.domain.whiskey.search.service.WhiskeySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor

public class WhiskeyService {
    private final WhiskeyRepository whiskeyRepository;
    private final WhiskeysNoteCacheRepository whiskeysNoteCacheRepository;
    private final AvgWhiskeyTagRepository avgWhiskeyTagRepository;
    private final WhiskeySearchService whiskeySearchService;

    // 위스키 전체 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> getWhiskeys(int page, int size) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.ASC, "name")
        );

        return whiskeyRepository.findAll(pageRequest)
                .map(WhiskeyCardResponse::from);
    }

    // 위스키 이름 검색 (포함검색, 대소문자 구분X)
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> searchWhiskeys(String q, int page, int size) {
        return whiskeySearchService.searchByKeyword(q, page, size);
    }

    // 위스키 필터링 검색
    @Transactional(readOnly = true)
    public Page<WhiskeyCardResponse> filterWhiskeys(WhiskeyFilterRequest request) {
        PageRequest pageRequest = PageRequest.of(
                request.pageOrDefault(),
                request.sizeOrDefault(),
                Sort.by(Sort.Direction.ASC, "name")
        );

        return whiskeyRepository.findAll(WhiskeySpecification.filter(request), pageRequest)
                .map(WhiskeyCardResponse::from);
    }

    // 위스키 상세 조회
    @Transactional(readOnly = true)
    public WhiskeyDetailResponse getWhiskeyDetail(Long whiskeyId) {
        Whiskey whiskey = whiskeyRepository.findById(whiskeyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "위스키를 찾을 수 없습니다."
                ));
        WhiskeysNoteCache cache = whiskeysNoteCacheRepository.findByWhiskeyId(whiskeyId)
                .orElse(null);
        NoteSummaryDto noteSummary = cache == null ? null : toNoteSummaryDto(cache);
        List<TagSummaryDto> tastingTags = cache == null
                ? List.of()
                : avgWhiskeyTagRepository.findByCacheIdOrderByCountDesc(cache.getId())
                .stream()
                .map(this::toTagSummaryDto)
                .toList();

        return new WhiskeyDetailResponse(
                whiskey.getId(),
                whiskey.getName(),
                whiskey.getNameEng(),
                whiskey.getType(),
                whiskey.getBrand(),
                whiskey.getImageUrl(),
                whiskey.getAbv(),
                whiskey.getAgeYears(),
                whiskey.getCountry(),
                whiskey.getCask(),
                whiskey.getVolume(),
                whiskey.getPrice(),
                whiskey.getCostUrl(),
                whiskey.getCostUrlSource(),
                whiskey.getDescription(),
                whiskey.getNote(),
                noteSummary,
                tastingTags
        );
    }

    // 시음 요약 변환 메서드 - 위스키 노트 캐시에서 시음 요약 DTO로 변환하는 메서드
    private NoteSummaryDto toNoteSummaryDto(WhiskeysNoteCache cache) {
        int count = cache.getCount() == null ? 0 : cache.getCount();

        Integer bodyScore = averageScore(cache.getBodyScore(), count);
        Integer finishScore = averageScore(cache.getFinishScore(), count);
        Integer smokyScore = averageScore(cache.getSmokyScore(), count);
        Integer spicyScore = averageScore(cache.getSpicyScore(), count);
        Integer sweetScore = averageScore(cache.getSweetScore(), count);

        return new NoteSummaryDto(
                count,
                bodyScore,
                finishScore,
                smokyScore,
                spicyScore,
                sweetScore,
                List.of(
                        new TasteItemDto("body", "바디", bodyScore),
                        new TasteItemDto("finish", "피니시", finishScore),
                        new TasteItemDto("smoky", "스모키", smokyScore),
                        new TasteItemDto("spicy", "스파이시", spicyScore),
                        new TasteItemDto("sweet", "스위트", sweetScore)
                )
        );
    }

    // 평균 점수 계산 메서드 - 총 점수와 시음 노트 수를 받아 평균 점수를 계산하는 메서드
    private Integer averageScore(Long totalScore, int count) {
        if (totalScore == null || count <= 0) {
            return 0;
        }

        return Math.toIntExact(Math.round((double) totalScore / count));
    }

    // 태그 요약 변환 메서드 - 평균 위스키 태그 엔티티에서 태그 요약 DTO로 변환하는 메서드
    private TagSummaryDto toTagSummaryDto(AvgWhiskeyTag avgWhiskeyTag) {
        return new TagSummaryDto(
                avgWhiskeyTag.getTag().getId(),
                avgWhiskeyTag.getTag().getName(),
                avgWhiskeyTag.getTag().getCategory(),
                avgWhiskeyTag.getTag().getImageUrl(),
                avgWhiskeyTag.getCount()
        );
    }
}
