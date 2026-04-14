package resume.analysis.ResumeAnalysis.dto;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public record Experiencia(
    String empresa,
    String cargo,
    String inicio,
    String fim
){}

