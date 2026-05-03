package resume.analysis.ResumeAnalysis.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import resume.analysis.ResumeAnalysis.dto.AnalysesResponse;
import resume.analysis.ResumeAnalysis.dto.JobRecommendation;
import resume.analysis.ResumeAnalysis.dto.ResumeWithJobsResponse;
import resume.analysis.ResumeAnalysis.service.JobRecommendationService;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/doc")
public class DocumentController {

    private final ChatClient chatClient;
    private final String systemPrompt;
    private final JobRecommendationService jobRecommendationService;

    public DocumentController(ChatClient.Builder builder,
                              JobRecommendationService jobRecommendationService) {
        this.chatClient = builder.build();
        this.jobRecommendationService = jobRecommendationService;
        try {
            this.systemPrompt = new ClassPathResource("prompts/systemprompt.st")
                    .getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao carregar system prompt", e);
        }
    }


    @PostMapping("/process")
    public AnalysesResponse uploadArchive(@RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        try {
            String resumeText = extractTextFromPdf(arquivo);
            return analyzeResume(resumeText);
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // /analyses
    // -------------------------------------------------------------------------

    @Operation(
            summary = "Analisa o texto extraído do currículo enviado e a IA recomenda uma vaga da API https://www.arbeitnow.com/api/job-board-api.",
            description = "Recebe um arquivo PDF, extrai o texto, analisa com IA e retorna as melhores vagas da API Arbeitnow para o perfil do candidato."
    )
    @ApiResponse(responseCode = "200", description = "Análise e recomendações retornadas com sucesso")
    @PostMapping("/analyse")
    public ResumeWithJobsResponse uploadAndRecommend(@RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        try {
            String resumeText = extractTextFromPdf(arquivo);
            AnalysesResponse analysis = analyzeResume(resumeText);
            if (analysis == null) return null;
            List<JobRecommendation> recommendations = jobRecommendationService.recommendJobs(analysis);
            return new ResumeWithJobsResponse(recommendations);
        } catch (Exception e) {
            System.out.println(e);
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String extractTextFromPdf(MultipartFile arquivo) throws IOException {
        byte[] pdfBytes = arquivo.getBytes();
        PDDocument document = Loader.loadPDF(pdfBytes);
        PDFTextStripper stripper = new PDFTextStripper();
        return stripper.getText(document);
    }

    private AnalysesResponse analyzeResume(String resumeText) {
        return chatClient.prompt()
                .system(systemPrompt)
                .user(u -> u.text("Analise o curriculo a seguir:\n\n" + resumeText))
                .call()
                .entity(AnalysesResponse.class);
    }
}