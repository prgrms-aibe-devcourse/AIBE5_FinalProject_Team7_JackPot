package com.jackpot.whiskeynote.domain.admin.service;

import com.jackpot.whiskeynote.domain.admin.dto.*;
import com.jackpot.whiskeynote.domain.admin.entity.*;
import com.jackpot.whiskeynote.domain.admin.repository.ReportActionsRepository;
import com.jackpot.whiskeynote.domain.admin.repository.ReportsRepository;
import com.jackpot.whiskeynote.domain.community.comment.entity.PostComment;
import com.jackpot.whiskeynote.domain.community.comment.repository.PostCommentRepository;
import com.jackpot.whiskeynote.domain.community.post.entity.Post;
import com.jackpot.whiskeynote.domain.community.post.repository.PostRepository;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
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
public class ReportService {
    private final ReportsRepository reportsRepository;
    private final ReportActionsRepository reportActionsRepository;
    private final PostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final UsersRepository usersRepository;

    /**
     * RPT-01: 신고 생성
     * @param userId 신고자 id
     * @param reportCreateDto 신청한 신고 내역
     * @return 신청한 신고 상세
     */
    @Transactional
    public ReportDetailDto createReport(Long userId, ReportCreateDto reportCreateDto){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        // 중복 방지
        if(reportsRepository.existsByReporterIdAndTargetIdAndTargetType(userId, reportCreateDto.targetId(), reportCreateDto.targetType())){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 신고한 게시글입니다.");
        }

        if(reportCreateDto.targetType() == ReportTargetType.POST){
            postRepository.findById(reportCreateDto.targetId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        } else if(reportCreateDto.targetType() == ReportTargetType.COMMENT){
            commentRepository.findById(reportCreateDto.targetId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "예외적인 신고 대상입니다. 관리자에게 문의 바랍니다.");
        }

        return ReportDetailDto.from(reportsRepository
                .save(Reports.create(user, reportCreateDto.targetId(), reportCreateDto.targetType(), reportCreateDto.reason(), reportCreateDto.detail()))
        );
    }

    /**
     * ADM-03: 신고 목록 조회(전체)
     * @param status 신고 상태
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 신고 목록
     */
    @Transactional(readOnly = true)
    public Page<ReportDto> findAllByStatus(String status, int page, int size){
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        if (status == null || status.isBlank()){
            return reportsRepository.findAll(pageRequest).map(ReportDto::from);
        } else {
            ReportStatus reportStatus;
            try {
                reportStatus = ReportStatus.valueOf(status.toUpperCase());
                return reportsRepository.findAllByStatusOrderByCreatedAtDesc(reportStatus, pageRequest).map(ReportDto::from);

            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "올바르지 않은 status 값입니다. (pending/approved/rejected)");
            }

        }
    }

    /**
     * ADM-03-1: 신고 상세 + 처리 이력
     * @param reportId 신고 id
     * @return 신고 상세
     */
    @Transactional(readOnly = true)
    public ReportDetailDto findById(Long reportId){
        Reports report = reportsRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "신고를 찾을 수 없습니다."));

        // 댓글 신고인 경우 원본 게시글 ID 조회
        Long postId = null;
        if (report.getTargetType() == ReportTargetType.COMMENT) {
            postId = commentRepository.findById(report.getTargetId())
                    .map(PostComment::getPostId)
                    .orElse(null);
        }

        // 처리 이력 조회
        List<ReportActionResultDto> actions = reportActionsRepository
                .findAllByReportOrderByCreatedAtDesc(report)
                .stream()
                .map(ReportActionResultDto::from)
                .toList();

        return new ReportDetailDto(
                report.getId(),
                report.getReporter().getNickname(),
                report.getTargetId(),
                postId,
                report.getTargetType().name(),
                report.getReason().name(),
                report.getDetail(),
                report.getStatus().name(),
                actions,
                report.getCreatedAt()
        );
    }


    /**
     * ADM-04: 신고 처리
     * @param reportId 신고 id
     * @param adminId 처리자 id
     * @param req 신고 처리 데이터
     */
    @Transactional
    public ReportDetailDto createReportAction(Long reportId, Long adminId, ReportActionDto req){
        Reports report = reportsRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 신고를 찾을 수 없습니다."));

        Users admin = usersRepository.findById(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "해당 관리자를 찾을 수 없습니다."));

        ReportActionType action;
        try {
            action = ReportActionType.valueOf(req.action().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "올바르지 않은 actionStatus 값 입니다.");
        }

        switch (action) {
            case HIDE, DELETE_CONTENT:
                if(report.getTargetType() == ReportTargetType.POST){
                    Post post = postRepository.findById(report.getTargetId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

                    post.softDelete();
                } else if(report.getTargetType() == ReportTargetType.COMMENT){
                    PostComment comment = commentRepository.findById(report.getTargetId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

                    comment.softDelete();
                }

                report.updateStatus(ReportStatus.HIDDEN);
                break;

            case RESTORE:
                if(report.getTargetType() == ReportTargetType.POST){
                    Post post = postRepository.findById(report.getTargetId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

                    post.restore();
                } else if(report.getTargetType() == ReportTargetType.COMMENT){
                    PostComment comment = commentRepository.findById(report.getTargetId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

                    comment.restore();
                }

                report.updateStatus(ReportStatus.RESTORED);
                break;

            case DISMISS:
                report.updateStatus(ReportStatus.DISMISSED);
                break;
        }

        // 처리 이력 추가
        reportActionsRepository.save(ReportActions.create(report, admin, action, req.note()));
        return findById(reportId);
    }

}
