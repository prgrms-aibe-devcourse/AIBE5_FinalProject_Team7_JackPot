# CI(GitHub Actions)에서 ./gradlew bootJar 로 JAR을 먼저 빌드한 뒤 이미지를 만듭니다.
# 로컬: backend/ 에서 ./gradlew bootJar && docker build .
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
