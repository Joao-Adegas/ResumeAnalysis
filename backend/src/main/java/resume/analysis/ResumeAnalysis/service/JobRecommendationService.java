package resume.analysis.ResumeAnalysis.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import resume.analysis.ResumeAnalysis.dto.AnalysesResponse;
import resume.analysis.ResumeAnalysis.dto.JobRecommendation;
import resume.analysis.ResumeAnalysis.dto.JobSearchResult;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class JobRecommendationService {

    private static final String ARBEITNOW_API = "https://www.arbeitnow.com/api/job-board-api";
    private static final int PAGES_TO_FETCH = 3; // busca páginas 1, 3, 5 para variedade

    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    private final String jobPrompt;

    public JobRecommendationService(ChatClient.Builder builder, RestTemplate restTemplate) {
        this.chatClient = builder.build();
        this.restTemplate = restTemplate;

        try{
            this.jobPrompt = new ClassPathResource("prompts/jobrecommendation.st").getContentAsString(StandardCharsets.UTF_8);
        }catch (IOException e){
            throw  new RuntimeException(("Erro ao carregar job prompt."));
        }
    }

    public List<JobRecommendation> recommendJobs(AnalysesResponse resume) {
        // 1. Extrai keywords do perfil
        String keywords = extractKeywords(resume);
        // System.out.println("🔍 Keywords extraídas: " + keywords);

        // 2. Busca vagas de páginas distribuídas (1, 3, 5) para variedade
        List<JobSearchResult.Job> allJobs = fetchJobs();
        // System.out.println("📋 Total de vagas coletadas: " + allJobs.size());

        if (allJobs.isEmpty()) {
            System.out.println("❌ Nenhuma vaga encontrada. Verifique a conexão com a API.");
            return List.of();
        }

        // 3. AI filtra as mais relevantes (máx 15 candidatas)
        List<JobSearchResult.Job> filtered = aiFilterRelevant(allJobs, keywords);
        // System.out.println("✅ Vagas filtradas: " + filtered.size());

        // 4. AI ranqueia e retorna top 3
        return aiRankAndRecommend(filtered.isEmpty() ? allJobs.subList(0, Math.min(15, allJobs.size())) : filtered, resume, keywords);
    }

    private String extractKeywords(AnalysesResponse resume) {
        String skillsText = resume.pontosFortes() != null
                ? resume.pontosFortes().stream().map(s -> s.skill()).toList().toString()
                : "";

        return chatClient.prompt()
                .user(u -> u.text("""
                        Based on this resume, extract 5-8 job search keywords in English.
                        Return ONLY the keywords separated by commas, nothing else.

                        Profile: %s
                        Skills: %s
                        """.formatted(resume.resumoPerfil(), skillsText)))
                .call()
                .content();
    }

    private List<JobSearchResult.Job> fetchJobs() {
        List<JobSearchResult.Job> jobs = new ArrayList<>();
        int[] pages = {1, 3, 5}; // páginas distribuídas, evita rate limit

        for (int page : pages) {
            try {
                String url = ARBEITNOW_API + "?page=" + page;
                JobSearchResult result = restTemplate.getForObject(url, JobSearchResult.class);
                if (result != null && result.data() != null) {
                    jobs.addAll(result.data());
                    // System.out.println("✅ Página " + page + ": " + result.data().size() + " vagas");
                }
            } catch (Exception e) {
                System.err.println("❌ Erro na página " + page + ": " + e.getMessage());
            }
        }
        return jobs;
    }

    private List<JobSearchResult.Job> aiFilterRelevant(List<JobSearchResult.Job> jobs, String keywords) {
        // Manda no máximo 20 vagas para a AI (título + 3 tags = poucos tokens)
        String jobsText = jobs.stream()
                .limit(20)
                .map(j -> "SLUG:%s | TITLE:%s | TAGS:%s".formatted(
                        j.slug(),
                        j.title(),
                        j.tags().stream().limit(10).toList()))
                .toList()
                .toString();

        String response = chatClient.prompt()
                .user(u -> u.text("""
                        From the jobs below, return the slugs of the RELEVANT ones for a candidate with keywords: %s
                        Return ONLY the slugs separated by commas. If none match, return NONE.

                        Jobs:
                        %s
                        """.formatted(keywords, jobsText)))
                .call()
                .content();

        if (response == null || response.trim().equalsIgnoreCase("NONE")) return List.of();

        List<String> relevantSlugs = List.of(response.split(",")).stream()
                .map(String::trim)
                .toList();

        return jobs.stream()
                .filter(j -> relevantSlugs.stream().anyMatch(slug -> j.slug().contains(slug) || slug.contains(j.slug())))
                .toList();
    }

    private List<JobRecommendation> aiRankAndRecommend(
            List<JobSearchResult.Job> candidates,
            AnalysesResponse resume,
            String keywords) {

        if (candidates.isEmpty()) return List.of();

        String candidatesText = candidates.stream()
                .limit(10)
                .map(j -> "Slug: %s | Title: %s | Company: %s | Location: %s | Remote: %s | Tags: %s | URL: %s"
                        .formatted(j.slug(), j.title(), j.company_name(),
                                j.location(), j.remote(),
                                j.tags().stream().limit(10).toList(), j.url()))
                .toList()
                .toString();

        return chatClient.prompt().user(u -> u.text(jobPrompt.formatted(
                resume.nome(),
                resume.resumoPerfil(),
                keywords,
                candidatesText
                ))).call()
                .entity(new org.springframework.core.ParameterizedTypeReference<List<JobRecommendation>>() {});
    }
}