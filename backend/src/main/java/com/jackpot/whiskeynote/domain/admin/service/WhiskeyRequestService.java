package com.jackpot.whiskeynote.domain.admin.service;

import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestForm;
import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestResponse;
import com.jackpot.whiskeynote.domain.admin.dto.WhiskeyRequestReviewRequest;
import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequest;
import com.jackpot.whiskeynote.domain.admin.entity.WhiskeyRequestStatus;
import com.jackpot.whiskeynote.domain.admin.repository.WhiskeyRequestRepository;
import com.jackpot.whiskeynote.domain.member.entity.Role;
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

@Service
@RequiredArgsConstructor
public class WhiskeyRequestService {
    private final WhiskeyRequestRepository whiskeyRequestRepository;
    private final UsersRepository usersRepository;

    /**
     * 위스키 등록 요청 목록 조회(전체)_사용자 전용 — 본인 요청만 반환
     * @param userId 사용자 ID
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 조회 목록
     */
    @Transactional(readOnly = true)
    public Page<WhiskeyRequestResponse> findAllByUserId(Long userId, int page, int size){
        usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return whiskeyRequestRepository.findAllByRequesterIdOrderByCreatedAtDesc(userId, pageRequest)
                .map(WhiskeyRequestResponse::from);
    }

    /**
     * 위스키 등록 요청 목록 조회(전체)_관리자 전용 — 전체 요청 반환
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 조회 목록
     */
    @Transactional(readOnly = true)
    public Page<WhiskeyRequestResponse> findAllForAdmin(int page, int size){
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return whiskeyRequestRepository.findAllByOrderByCreatedAtDesc(pageRequest)
                .map(WhiskeyRequestResponse::from);
    }

    /**
     * 위스키 등록 요청 목록 조회(상태 필터)_사용자 전용 — 본인 요청만 반환
     * @param userId 사용자 ID
     * @param status 요청 상태
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 조회 목록
     */
    @Transactional(readOnly = true)
    public Page<WhiskeyRequestResponse> findAllByUserIdAndStatus(Long userId, String status, int page, int size){
        usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        WhiskeyRequestStatus requestStatus;
        try {
            requestStatus = WhiskeyRequestStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "올바르지 않은 status 값입니다. (pending/approved/rejected)");
        }

        return whiskeyRequestRepository.findAllByRequesterIdAndStatusOrderByCreatedAtDesc(
                userId,
                requestStatus,
                pageRequest
        ).map(WhiskeyRequestResponse::from);
    }

    /**
     * 위스키 등록 요청 목록 조회(상태 필터)_관리자 전용 — 전체 요청 반환
     * @param status 요청 상태
     * @param page 페이지 숫자
     * @param size 페이지 크기
     * @return 조회 목록
     */
    @Transactional(readOnly = true)
    public Page<WhiskeyRequestResponse> findAllByStatusForAdmin(String status, int page, int size){
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        WhiskeyRequestStatus requestStatus;
        try {
            requestStatus = WhiskeyRequestStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "올바르지 않은 status 값입니다. (pending/approved/rejected)");
        }

        return whiskeyRequestRepository.findAllByStatusOrderByCreatedAtDesc(requestStatus, pageRequest)
                .map(WhiskeyRequestResponse::from);
    }

    /**
     * 위스키 등록 요청 등록
     * @param userId 사용자 ID
     * @param form 요청 내용
     * @return 요청 상세
     */
    @Transactional
    public WhiskeyRequestResponse createRequest(Long userId, WhiskeyRequestForm form){
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WhiskeyRequest whiskeyReq = WhiskeyRequest.create(user, form.description());
        WhiskeyRequest saveData = whiskeyRequestRepository.save(whiskeyReq);
        
        return WhiskeyRequestResponse.from(saveData);
    }

    /**
     * 위스키 등록 요청 상세 조회
     * @param userId 사용자 ID
     * @param requestId 요청 ID
     * @return 요청 상세
     */
    @Transactional(readOnly = true)
    public WhiskeyRequestResponse findById(Long userId, Long requestId){
        usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WhiskeyRequest whiskeyReq = whiskeyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키 등록 요청 건을 찾을 수 없습니다."));

        return WhiskeyRequestResponse.from(whiskeyReq);
    }

    // 위스키 등록 요청 상세 수정_사용자

    /**
     * 위스키 등록 요청 상세 수정
     * @param userId 사용자 ID
     * @param requestId 요청 ID
     * @param form 요청 내용
     * @return 수정한 요청 상세
     */
    @Transactional
    public WhiskeyRequestResponse updateRequest(Long userId, Long requestId, WhiskeyRequestForm form){
        usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WhiskeyRequest whiskeyReq = whiskeyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키 등록 요청 건을 찾을 수 없습니다."));

        // 본인 요청인지 확인
        if (!whiskeyReq.getRequester().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정할 권한이 없습니다.");
        }

        // 수정 전에 상태 체크
        if (whiskeyReq.getStatus() != WhiskeyRequestStatus.pending) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대기중인 요청만 수정할 수 있습니다.");
        }
        // 수정
        whiskeyReq.update(form.description());

        return WhiskeyRequestResponse.from(whiskeyReq);
    }

    /**
     * 위스키 등록 요청 삭제
     * @param userId 사용자 ID
     * @param requestId 요청 ID
     */
    @Transactional
    public void deleteRequest(Long userId, Long requestId){
        usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        WhiskeyRequest whiskeyReq = whiskeyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키 등록 요청 건을 찾을 수 없습니다."));

        // 본인 요청인지 확인
        if (!whiskeyReq.getRequester().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제할 권한이 없습니다.");
        }

        // pending 상태만 삭제 가능
        if (whiskeyReq.getStatus() != WhiskeyRequestStatus.pending) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대기중인 요청만 삭제할 수 있습니다.");
        }

        whiskeyRequestRepository.delete(whiskeyReq);
    }

    /**
     * 위스키 등록 요청 승인/반려 처리
     * @param userId 사용자 ID
     * @param requestId 요청 ID
     * @param req 요청 내용
     * @return 요청 상세
     */
    @Transactional
    public WhiskeyRequestResponse reviewRequest(Long userId, Long requestId, WhiskeyRequestReviewRequest req)
    {
        Users admin = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."));

        if(!admin.getRole().equals(Role.ADMIN)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "관리자 권한이 없습니다.");
        }

        WhiskeyRequest whiskeyReq = whiskeyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "위스키 등록 요청 건을 찾을 수 없습니다."));

        // pending 상태만 처리 가능
        if (whiskeyReq.getStatus() != WhiskeyRequestStatus.pending) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "대기중인 요청만 처리할 수 있습니다.");
        }

        whiskeyReq.updateRequestStatus(WhiskeyRequestStatus.valueOf(req.status()), admin);

        return WhiskeyRequestResponse.from(whiskeyReq);
    }
}
