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

    @Transactional(readOnly = true)
    public WhiskeyColumnResponse getColumn(Long id) {
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
