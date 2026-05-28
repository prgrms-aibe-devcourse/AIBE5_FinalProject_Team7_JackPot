package com.jackpot.whiskeynote.domain.community.comment.service;

import com.jackpot.whiskeynote.domain.community.comment.dto.CommentCreateRequest;
import com.jackpot.whiskeynote.domain.community.comment.dto.CommentTreeResponse;
import com.jackpot.whiskeynote.domain.community.comment.dto.CommentUpdateRequest;
import com.jackpot.whiskeynote.domain.community.comment.entity.PostComment;
import com.jackpot.whiskeynote.domain.community.comment.entity.PostCommentTree;
import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentRepository;
import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentTreeRepository;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final PostCommentRepository postCommentRepository;
    private final PostCommentTreeRepository postCommentTreeRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;

    // CMT-01: 댓글 목록 (tree)
    @Transactional(readOnly = true)
    public List<CommentTreeResponse> getComments(Long postId) {
        validatePostExists(postId);

        List<PostComment> allComments = postCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        if (allComments.isEmpty()) return List.of();

        List<Long> commentIds = allComments.stream().map(PostComment::getId).toList();

        Map<Long, List<Long>> parentToChildren = postCommentTreeRepository
                .findByDepthAndDescendantIdIn(1, commentIds)
                .stream()
                .collect(Collectors.groupingBy(
                        PostCommentTree::getAncestorId,
                        Collectors.mapping(PostCommentTree::getDescendantId, Collectors.toList())
                ));

        Map<Long, PostComment> commentMap = allComments.stream()
                .collect(Collectors.toMap(PostComment::getId, c -> c));

        Set<Long> userIds = allComments.stream()
                .filter(c -> !c.isDeleted())
                .map(PostComment::getUserId)
                .collect(Collectors.toSet());
        Map<Long, String> nicknameMap = usersRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Users::getId, Users::getNickname));

        Set<Long> childIds = parentToChildren.values().stream()
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());

        return allComments.stream()
                .filter(c -> !childIds.contains(c.getId()))
                .map(c -> buildTree(c, parentToChildren, commentMap, nicknameMap))
                .toList();
    }

    // CMT-02: 댓글 작성 (대댓글 지원)
    @Transactional
    public Long createComment(Long userId, Long postId, CommentCreateRequest request) {
        validatePostExists(postId);

        Long parentCommentId = request.parentCommentId();
        if (parentCommentId != null && !postCommentRepository.existsById(parentCommentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "부모 댓글을 찾을 수 없습니다.");
        }

        PostComment comment = PostComment.create(postId, userId, request.content());
        postCommentRepository.save(comment);

        postCommentTreeRepository.save(new PostCommentTree(comment.getId(), comment.getId(), 0));

        if (parentCommentId != null) {
            List<PostCommentTree> ancestorPaths =
                    postCommentTreeRepository.findByDescendantId(parentCommentId);
            for (PostCommentTree path : ancestorPaths) {
                postCommentTreeRepository.save(
                        new PostCommentTree(path.getAncestorId(), comment.getId(), path.getDepth() + 1));
            }
        }

        return comment.getId();
    }

    // CMT-03: 댓글 삭제 (soft delete)
    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        if (comment.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미 삭제된 댓글입니다.");
        }
        if (!comment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
        }
        comment.softDelete();
    }

    // CMT-04: 댓글 수정
    @Transactional
    public void updateComment(Long userId, Long commentId, CommentUpdateRequest request) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        if (comment.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제된 댓글입니다.");
        }
        if (!comment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다.");
        }
        comment.update(request.content());
    }

    private CommentTreeResponse buildTree(PostComment comment,
                                          Map<Long, List<Long>> parentToChildren,
                                          Map<Long, PostComment> commentMap,
                                          Map<Long, String> nicknameMap) {
        List<CommentTreeResponse> replies = parentToChildren
                .getOrDefault(comment.getId(), List.of())
                .stream()
                .map(childId -> buildTree(commentMap.get(childId), parentToChildren, commentMap, nicknameMap))
                .toList();
        String nickname = nicknameMap.get(comment.getUserId());
        return CommentTreeResponse.from(comment, nickname, replies);
    }

    private void validatePostExists(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다.");
        }
    }
}
