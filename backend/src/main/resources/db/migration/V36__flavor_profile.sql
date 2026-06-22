CREATE TABLE flavor_profile (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    body_score   DOUBLE NOT NULL,
    finish_score DOUBLE NOT NULL,
    smoky_score  DOUBLE NOT NULL,
    spicy_score  DOUBLE NOT NULL,
    sweet_score  DOUBLE NOT NULL,
    created_at  DATETIME NOT NULL,
    updated_at  DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_flavor_profile_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE flavor_profile_tags (
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    flavor_profile_id  BIGINT NULL,
    tag_id              BIGINT NULL,
    weight              DOUBLE NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_flavor_profile_tags_flavor_profile
        FOREIGN KEY (flavor_profile_id) REFERENCES flavor_profile (id),
    CONSTRAINT fk_flavor_profile_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;