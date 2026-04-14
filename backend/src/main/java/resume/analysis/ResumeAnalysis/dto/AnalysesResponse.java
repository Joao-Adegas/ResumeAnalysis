package resume.analysis.ResumeAnalysis.dto;
import java.util.List;

public record AnalysesResponse(
        String nome,
        String resumoPerfil,
        List<Skills> pontosFortes,
        List<Skills> pontosFracos,
        List<Experiencia> experiencia
){}

