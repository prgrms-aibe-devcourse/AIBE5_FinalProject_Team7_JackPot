package com.jackpot.whiskeynote.global.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {

    @Bean
    public FlywayMigrationStrategy flywayRepairStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
