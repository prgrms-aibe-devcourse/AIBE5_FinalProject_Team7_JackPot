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

