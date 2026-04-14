package resume.analysis.ResumeAnalysis.dto;

import java.util.List;

public record ResumeWithJobsResponse(
        List<JobRecommendation> jobRecommendations
) {}