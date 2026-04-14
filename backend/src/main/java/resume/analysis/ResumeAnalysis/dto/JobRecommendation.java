package resume.analysis.ResumeAnalysis.dto;

public record JobRecommendation(
        String resume,
        String title,
        String company,
        String location,
        boolean remote,
        String url,
        int matchScore,
        String matchReason
) {}