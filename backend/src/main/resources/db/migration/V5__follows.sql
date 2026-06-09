CREATE TABLE IF NOT EXISTS follows (
    id BIGINT NOT NULL AUTO_INCREMENT,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UK_follows_follower_following (follower_id, following_id),
    CONSTRAINT FK_follows_follower FOREIGN KEY (follower_id) REFERENCES users (id),
    CONSTRAINT FK_follows_following FOREIGN KEY (following_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
