package com.jackpot.whiskeynote.domain.community.column.service;

import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentRepository;
import com.jackpot.whiskeynote.domain.community.post.dto.PostSummaryResponse;
import com.jackpot.whiskeynote.domain.community.post.entity.PostType;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;

    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getColumns(int page, int size) {
        return postRepository
                .findByPostTypeAndIsDeletedFalseOrderByCreatedAtDesc(PostType.COLUMN, PageRequest.of(page, size))
                .map(p -> PostSummaryResponse.from(p,
                        postCommentRepository.countByPostIdAndIsDeletedFalse(p.getId())));
    }
}
