"use client";

import { useState } from "react";

type Job = {
  resume: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  matchScore: number;
  matchReason: string;
};

type JobCardProps = {
  job: Job;
  index: number;
};

type JobRecommendationsProps = {
  jobs: Job[];
};

type ChevronIconProps = {
  open: boolean;
};

type ScoreRingProps = {
  score: number;
};

function getCompanyTheme(company: string) {
  const themes = [
    { bg: "bg-green-950", text: "text-green-400" },
    { bg: "bg-green-900", text: "text-green-300" },
    { bg: "bg-emerald-950", text: "text-emerald-400" },
    { bg: "bg-green-950", text: "text-green-500" },
    { bg: "bg-teal-950", text: "text-teal-400" },
    { bg: "bg-emerald-900", text: "text-emerald-300" },
  ];
  const index =
    company.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    themes.length;
  const initials = company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return { ...themes[index], initials };
}

function ScoreRing({ score }: ScoreRingProps) {
  const cx = 24, cy = 24, r = 19;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = score >= 90 ? "#4ade80" : score >= 80 ? "#86efac" : "#a3e635";

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="3.5" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tracking-tight"
        style={{ color }}
      >
        {score}%
      </div>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 13L13 3M9 3h4v4" />
    </svg>
  );
}

function ChevronIcon({ open }: ChevronIconProps) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 16 16" fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
    >
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function JobCard({ job, index }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const theme = getCompanyTheme(job.company);

  return (
    <div
      className="group flex flex-col gap-3 rounded-2xl border border-gray-800 bg-black p-5 transition-all duration-200 hover:border-green-400/20 hover:bg-gray-900 hover:shadow-[0_0_0_1px_rgba(74,222,128,0.08),0_4px_24px_rgba(0,0,0,0.4)]"
      style={{ animation: `fadeSlideIn 0.35s ease both`, animationDelay: `${index * 0.08}s` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 text-sm font-bold ${theme.bg} ${theme.text}`}>
            {theme.initials}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
              {job.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">{job.company}</p>
          </div>
        </div>
        <ScoreRing score={job.matchScore} />
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-800 bg-gray-900 px-2.5 py-0.5 text-xs text-gray-400">
          <LocationIcon />
          {job.location}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          job.remote
            ? "border-green-900 bg-green-950 text-green-400"
            : "border-stone-800 bg-stone-950 text-stone-400"
        }`}>
          {job.remote ? "Remoto" : "Presencial"}
        </span>
      </div>

      {/* Match reason */}
      <p className="border-l-2 border-gray-800 pl-3 text-sm leading-relaxed text-gray-400">
        {job.matchReason}
      </p>

      {/* Resume expanded */}
      {expanded && (
        <div className="animate-[fadeIn_0.2s_ease] rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm leading-relaxed text-gray-400">
          {job.resume}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-800 pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          {expanded ? "fechar dica" : "como se candidatar"}
          <ChevronIcon open={expanded} />
        </button>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3.5 py-1.5 text-sm font-medium text-gray-300 transition-all hover:border-green-400 hover:bg-green-950 hover:text-green-400"
        >
          Ver vaga
          <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

export function JobRecommendations({ jobs }: JobRecommendationsProps) {
  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5 px-4 sm:px-6">
        <p className="text-center text-3xl text-gray-500">
          {jobs.length} {jobs.length === 1 ? "vaga encontrada" : "vagas encontradas"} para o seu perfil
        </p>
        {jobs.map((job, i) => (
          <JobCard key={`${job.url}-${i}`} job={job} index={i} />
        ))}
      </div>
    </>
  );
}