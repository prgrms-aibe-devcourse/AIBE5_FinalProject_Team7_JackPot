package com.jackpot.whiskeynote.domain.member.service;

import com.jackpot.whiskeynote.domain.member.dto.UpdateUserMeRequest;
import com.jackpot.whiskeynote.domain.member.dto.UserMeDto;
import com.jackpot.whiskeynote.domain.member.entity.Users;
import com.jackpot.whiskeynote.domain.member.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserMeService {

    private final UsersRepository usersRepository;

    public UserMeDto getMe(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return UserMeDto.from(user);
    }

    @Transactional
    public UserMeDto updateMe(Long userId, UpdateUserMeRequest request) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            String newNickname = request.getNickname().trim();
            if (!newNickname.equals(user.getNickname()) && usersRepository.existsByNickname(newNickname)) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
            user.updateNickname(newNickname);
        }

        // bottleShareOptIn: MVP에서는 저장 보류 (스키마 확정 후 반영)

        return UserMeDto.from(user);
    }
}

