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

