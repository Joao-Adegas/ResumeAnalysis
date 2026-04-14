package resume.analysis.ResumeAnalysis.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Resume Analysis API")
                        .version("1.0")
                        .description("API para análise de currículos e recomendação de vagas combase na API: https://www.arbeitnow.com/api/job-board-api"));
    }
}