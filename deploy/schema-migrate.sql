-- =====================================================
-- RDS 스키마 최신화 (prod, ddl-auto=validate 대응)
-- 대상 DB: whiskeynote
-- 실행: deploy/run-rds-migrate.sh (EC2) 또는 DBeaver에서 직접 실행
-- =====================================================

USE whiskeynote;

-- Feat/be#130 리뷰 좋아요 (2026-06 — prod 로그: missing table [review_likes])
CREATE TABLE IF NOT EXISTS review_likes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UK_REVIEW_LIKE_USER_REVIEW UNIQUE (user_id, review_id),
    CONSTRAINT FK_review_likes_review FOREIGN KEY (review_id) REFERENCES reviews (id),
    CONSTRAINT FK_review_likes_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feat#146 위시리스트 (2026-06 — prod 로그: missing table [wishlist_folders])
CREATE TABLE IF NOT EXISTS wishlist_folders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_wishlist_folders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    whiskey_id BIGINT NOT NULL,
    folder_id BIGINT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_wishlist_items_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT FK_wishlist_items_whiskey FOREIGN KEY (whiskey_id) REFERENCES whiskeys (id),
    CONSTRAINT FK_wishlist_items_folder FOREIGN KEY (folder_id) REFERENCES wishlist_folders (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feat#180 위스키 등록 요청 (2026-06 — prod 로그: missing table [whiskey_requests])
CREATE TABLE IF NOT EXISTS whiskey_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    requester_id BIGINT NULL,
    approved_whiskey_id BIGINT NULL,
    description JSON NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reviewed_by BIGINT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_whiskey_requests_requester FOREIGN KEY (requester_id) REFERENCES users (id),
    CONSTRAINT FK_whiskey_requests_approved_whiskey FOREIGN KEY (approved_whiskey_id) REFERENCES whiskeys (id),
    CONSTRAINT FK_whiskey_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
