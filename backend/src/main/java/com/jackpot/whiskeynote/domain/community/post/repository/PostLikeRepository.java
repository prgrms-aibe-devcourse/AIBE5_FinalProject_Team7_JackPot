// 게시글 좋아요 JPA 레포지토리 - 중복 확인 및 특정 사용자-게시글 조합의 좋아요 삭제 기능 제공
package com.jackpot.whiskeynote.domain.community.post.repository;

import com.jackpot.whiskeynote.domain.community.post.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    /** 특정 사용자가 특정 게시글에 이미 좋아요를 눌렀는지 중복 체크 용도 */
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    /**
     * 좋아요 취소 시 userId + postId 조합으로 레코드를 직접 삭제.
     *
     * @Modifying 필수: deleteBy... 메서드는 영속성 컨텍스트를 거치지 않고 바로 DELETE 쿼리를 실행하므로
     * 트랜잭션 내에서 @Modifying 없이 사용하면 예외가 발생할 수 있음.
     */
    @Modifying
    void deleteByUserIdAndPostId(Long userId, Long postId);
}
