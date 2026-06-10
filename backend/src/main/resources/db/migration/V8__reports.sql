CREATE TABLE reports
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    reporter_id BIGINT       NULL,
    target_id   BIGINT       NOT NULL,
    target_type VARCHAR(20)  NOT NULL,
    reason      VARCHAR(20)  NOT NULL,
    detail      VARCHAR(500) NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE report_actions
(
    id        BIGINT      NOT NULL AUTO_INCREMENT,
    report_id BIGINT      NOT NULL,
    admin_id  BIGINT      NOT NULL,
    action    VARCHAR(30) NOT NULL,
    note      VARCHAR(500) NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_report_actions_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
    CONSTRAINT fk_report_actions_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
);
