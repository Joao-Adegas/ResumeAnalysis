# ResumeAnalysis

<!-- Insert platform demo GIF here -->
![Demo](./demo.gif)

---

## Overview

ResumeAnalysis is a full-stack web application that analyzes resumes using artificial intelligence and recommends job opportunities based on the candidate's profile. The user uploads a PDF resume, the system extracts the text, processes it through an AI model, and returns the top matching job listings from a public job board API.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)

---

## Features

- PDF resume upload and text extraction
- AI-powered resume analysis using OpenAI via Spring AI
- Automatic job recommendation based on candidate profile
- Match score and match reason for each recommended job
- Responsive interface for desktop and mobile
- Rate limiting to prevent API abuse
- CORS protection

---

## Architecture

The project follows a monorepo structure with two independent services:

```
ResumeAnalysis/
├── backend/         # Spring Boot REST API
└── frontend/        # Next.js web application
```

The frontend communicates with the backend via HTTP. The backend processes the resume, calls the OpenAI API through Spring AI, fetches job listings from the Arbeitnow public API, and returns ranked recommendations to the frontend.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.3 | React framework with SSR support |
| React | 19 | UI component library |
| TypeScript | 5 | Static typing |
| Tailwind CSS | 4 | Utility-first styling |
| Axios | latest | HTTP client for API requests |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Programming language |
| Spring Boot | 3.3.5 | Application framework |
| Spring AI | 1.0.0-M6 | OpenAI integration |
| Spring Web MVC | 6.1.14 | REST API and CORS configuration |
| Apache PDFBox | 3.0.3 | PDF text extraction |
| Bucket4j | 8.7.0 | Rate limiting per IP |
| SpringDoc OpenAPI | latest | Swagger API documentation |
| RestTemplate | built-in | HTTP client for external APIs |

### External APIs

| API | Purpose |
|---|---|
| OpenAI API | Resume analysis and job recommendation ranking |
| Arbeitnow Job Board API | Source of job listings |

### Infrastructure

| Service | Purpose |
|---|---|
| Railway | Backend hosting |
| Netlify | Frontend hosting |
| GitHub | Version control and CI/CD trigger |

---

## Getting Started

### Prerequisites

- Java 21
- Node.js 18 or higher
- Maven
- OpenAI API key

### Running the Backend

```bash
cd backend
cp .env.example .env
# fill in your environment variables
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`.

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`.

---

## Environment Variables

### Backend — `application-local.properties`

```properties
spring.ai.openai.api-key=your_openai_api_key
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Production

| Service | Variable | Value |
|---|---|---|
| Railway | `SPRING_AI_OPENAI_API_KEY` | Your OpenAI API key |
| Railway | `SPRING_PROFILES_ACTIVE` | `default` |
| Netlify | `NEXT_PUBLIC_API_URL` | Your Railway backend URL |

---

## API Reference

### POST `/doc/analyse`

Receives a PDF file, extracts the text, analyzes the candidate profile using AI, fetches job listings, and returns the top recommendations.

**Request**

```
Content-Type: multipart/form-data
```

| Parameter | Type | Description |
|---|---|---|
| `arquivo` | File (PDF) | The resume file to be analyzed |

**Response**

```json
{
  "jobRecommendations": [
    {
      "title": "Frontend Developer",
      "company": "Example GmbH",
      "location": "Berlin",
      "remote": true,
      "url": "https://www.arbeitnow.com/jobs/...",
      "matchScore": 92,
      "matchReason": "Strong match based on React and TypeScript skills.",
      "resume": "Your experience with React aligns well with this position."
    }
  ]
}
```

**Error Responses**

| Status | Description |
|---|---|
| 429 | Too many requests. Rate limit exceeded (5 requests per minute per IP). |
| 500 | Internal server error during processing. |

---

## Deployment

### Backend — Railway

1. Connect your GitHub repository to Railway.
2. Set the root directory to `backend`.
3. Railway will detect Maven and build automatically using `./mvnw`.
4. Add the required environment variables in the Railway dashboard under **Variables**.
5. Generate a public domain under **Settings → Networking → Public Networking**.

### Frontend — Netlify

1. Connect your GitHub repository to Netlify.
2. Configure the build settings:

| Setting | Value |
|---|---|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `.next` |

3. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your Railway domain.
4. Trigger a deploy with **Clear cache and deploy site** after setting environment variables.

---

## Security

- **CORS**: Configured at the filter level to allow only the production frontend origin.
- **Rate Limiting**: Each IP address is limited to 5 requests per minute on the `/doc/analyse` endpoint using Bucket4j.
- **File Validation**: Only PDF files under 5MB are accepted.
- **Environment Variables**: Sensitive keys such as the OpenAI API key are stored exclusively as environment variables and never committed to the repository.
- **No credentials in source**: The `.env` and `application-local.properties` files are listed in `.gitignore`.