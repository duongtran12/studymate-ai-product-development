package com.tritagon.studymate.config;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.tritagon.studymate.web.CurrentUserIdResolver;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

	private final CurrentUserIdResolver currentUserIdResolver;

	public WebConfiguration(CurrentUserIdResolver currentUserIdResolver) {
		this.currentUserIdResolver = currentUserIdResolver;
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(currentUserIdResolver);
	}
}
