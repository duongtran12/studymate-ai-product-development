package com.tritagon.studymate.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class FlywayMigrationConfiguration {

	@Bean
	@Order(1)
	ApplicationRunner runDatabaseMigrations(DataSource dataSource) {
		return arguments -> Flyway.configure()
				.dataSource(dataSource)
				.locations("classpath:db/migration")
				.load()
				.migrate();
	}
}
