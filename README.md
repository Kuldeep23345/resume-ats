# Resume Analyzer

AI-powered resume analysis tool that evaluates your resume against ATS (Applicant Tracking Systems) and provides actionable feedback to improve your chances of landing your dream job.

## Features

- **File Upload**: Drag & drop or click to upload PDF or DOCX resume files
- **Text Extraction**: Automatic extraction of text from PDF and DOCX files
- **AI Analysis**: Powered by NVIDIA's AI models for intelligent analysis
- **ATS Scoring**: Get an ATS compatibility score (0-100)
- **Tech Stack Detection**: Identify skills and technologies in your resume
- **Strengths & Weaknesses**: Detailed breakdown of what's working and what needs improvement
- **Missing Keywords**: Keywords commonly requested but missing from your resume
- **Suggestions**: Actionable recommendations to improve your resume
- **Career Advice**: Personalized career guidance

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19 + Tailwind CSS
- **AI**: OpenAI SDK + NVIDIA API
- **File Parsing**: pdf-parse (PDF), mammoth (DOCX)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- NVIDIA API Key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts    # POST /api/analyze endpoint
│   ├── page.tsx              # Main landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   └── circular-progress.tsx
│   └── home/
│       ├── ResumeAnalyzer.tsx    # Main upload component
│       ├── ATSDashboard.tsx      # Results dashboard
│       ├── LoadingState.tsx       # Loading animation
│       └── ErrorState.tsx         # Error handling
├── lib/
│   ├── extractors/
│   │   ├── pdf.ts         # PDF text extraction
│   │   ├── docx.ts       # DOCX text extraction
│   │   └── index.ts     # Extractor factory
│   ├── services/
│   │   ├── ai-analyzer.ts    # AI resume analysis
│   │   └── file-analyzer.ts # File handling
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts          # TypeScript types
```

## API

### POST /api/analyze

Analyze a resume file.

**Request**: `multipart/form-data`

- `file`: Resume file (PDF or DOCX, max 10MB)

**Response**: `application/json`

```json
{
  "success": true,
  "data": {
    "role": "Software Engineer",
    "level": "Mid-Level",
    "score": 75,
    "techStack": ["React", "Node.js", "TypeScript"],
    "strengths": ["Strong technical skills", "Good project descriptions"],
    "weaknesses": ["Missing ATS keywords", "No quantified results"],
    "missingKeywords": ["AWS", "CI/CD", "Docker"],
    "suggestions": ["Add quantifiable metrics", "Include AWS experience"],
    "advice": "Focus on adding cloud technologies..."
  }
}
```

## License

MIT