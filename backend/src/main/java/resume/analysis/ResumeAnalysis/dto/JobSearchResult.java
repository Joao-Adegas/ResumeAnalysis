package resume.analysis.ResumeAnalysis.dto;

import java.util.List;

public record JobSearchResult(
        List<Job> data,
        Links links,
        Meta meta
) {
    public record Job(
            String slug,
            String company_name,
            String title,
            String description,
            boolean remote,
            String url,
            List<String> tags,
            List<String> job_types,
            String location,
            long created_at
    ) {}

    public record Links(
            String first,
            String last,
            String prev,
            String next
    ) {}

    public record Meta(
            int current_page,
            int from,
            int last_page,
            int per_page,
            int to,
            int total
    ) {}
}