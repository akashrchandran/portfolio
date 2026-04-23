export interface ProjectArtifact {
  label: string;
  url: string;
}

export interface WorkExperience {
  year: string;
  endYear?: string;
  role: string;
  company: string;
  description: string;
  tech: string[];
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image?: string;
  technologies: string[];
  link?: string;
  github?: string;
  featured: boolean;
  category: string;
  impact?: string[];
  artifacts?: ProjectArtifact[];
  architecture?: {
    sourceRawUrl: string;
  };
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "chronos-reader",
    title: "Chronos Reader",
    description: "Read-it-later platform for extracting, storing, and managing web articles for long-term consumption.",
    longDescription:
      "Developed a multi-service system with a React frontend, NestJS backend, and Python scraping microservice. Implemented Server-Sent Events for real-time progress tracking and designed asynchronous processing pipelines for long-running scraping workflows.",
    image: "/projects/chronos-reader.jpg",
    technologies: ["React", "NestJS", "Python", "SSE"],
    featured: true,
    category: "Productivity",
    impact: [
      "Architected a distributed service setup for scraping and content management.",
      "Implemented real-time article processing updates with Server-Sent Events.",
      "Designed asynchronous pipelines for reliable long-running tasks.",
    ],
    artifacts: [],
  },
  {
    id: "2",
    slug: "youinpics",
    title: "YouInPics",
    description: "Event-based photo platform that helps users discover their photos automatically using face recognition.",
    longDescription:
      "Built a full-stack system with React and FastAPI for image uploads, processing, and similarity search workflows. Leveraged DeepFace for facial embeddings and implemented semantic search for retrieval across large photo sets.",
    image: "/projects/youinpics.jpg",
    technologies: ["React", "FastAPI", "Python", "DeepFace", "Embeddings"],
    featured: true,
    category: "AI",
    impact: [
      "Implemented automated identity matching against large uploaded image sets.",
      "Built semantic retrieval for similarity-based image search.",
      "Delivered an end-to-end full-stack image processing workflow.",
    ],
    artifacts: [],
  },
  {
    id: "3",
    slug: "quick-summarize-ai",
    title: "QuickSummarizeAI",
    description: "AI-powered tool for generating concise summaries from long-form content.",
    longDescription:
      "Built an AI-driven summarization tool that processes large text inputs and generates structured, concise summaries. Designed a responsive frontend for user interaction and integrated backend services with LLM APIs for efficient text processing. Focused on handling variable-length inputs, optimizing response times, and ensuring consistent summary quality.",
    image: "/projects/quick-summarize-ai.jpg",
    technologies: ["React", "Node.js", "LLM API", "REST"],
    featured: true,
    category: "AI",
    impact: [
      "Enabled fast summarization of long-form content into digestible insights.",
      "Integrated LLM APIs for dynamic and context-aware text generation.",
      "Handled large input sizes with optimized request and response flows.",
    ],
    artifacts: [],
  },
  {
    id: "4",
    slug: "gamesdrive",
    title: "GamesDrive",
    description: "Video game discovery platform for exploring and filtering games across genres, platforms, and preferences.",
    longDescription:
      "Developed a responsive game discovery web application using React, TypeScript, and Vite. Integrated external APIs to fetch real-time game data and implemented dynamic filtering by platform, genre, and other criteria. Focused on building a smooth user experience with efficient data fetching, state management, and loading states for handling network latency.",
    image: "/projects/gamesdrive.jpg",
    technologies: ["React", "TypeScript", "Vite", "API Integration"],
    featured: true,
    category: "Entertainment",
    impact: [
      "Built a scalable frontend architecture for browsing large game datasets.",
      "Integrated third-party APIs for real-time game discovery and filtering.",
      "Improved UX with responsive design and loading state handling.",
    ],
    artifacts: [],
  },
  {
    id: "5",
    slug: "upwork-notifier-bot",
    title: "Upwork Notifier Bot",
    description: "Automated job alert system that sends real-time Upwork job notifications to Telegram using RSS feeds.",
    longDescription:
      "Developed a Python-based automation tool that monitors Upwork job RSS feeds and pushes real-time notifications to Telegram chats. Designed to help freelancers quickly discover relevant opportunities by parsing job data and delivering structured alerts. Focused on efficient polling, filtering, and avoiding duplicate notifications for a reliable job discovery workflow.",
    image: "/projects/upwork-notifier.jpg",
    technologies: ["Python", "RSS", "Telegram Bot API"],
    featured: false,
    category: "Automation",
    impact: [
      "Enabled real-time job discovery by integrating Upwork RSS feeds with Telegram notifications.",
      "Automated monitoring of multiple job feeds to reduce manual search effort.",
      "Delivered structured job alerts with essential details for quick decision-making.",
    ],
    artifacts: [],
  },
  {
    id: "6",
    slug: "udemy-summarizer",
    title: "Udemy Summarizer",
    description: "Chrome extension that extracts Udemy video transcripts and generates AI-powered summaries using Google Gemini.",
    longDescription:
      "Developed a Chrome/Brave extension (Manifest v3) that extracts Udemy video transcripts and generates concise summaries using Google Gemini. Implemented custom transcript fetching logic from Udemy lesson pages and integrated Gemini APIs for context-aware summarization. Designed a lightweight extension UI with persistent storage using browser local storage to retain summaries across sessions. Focused on handling dynamic page content, asynchronous data extraction, and seamless user interaction within the browser environment.",
    image: "/projects/udemy-summarizer.jpg",
    technologies: ["JavaScript", "TypeScript", "Chrome Extension", "Google Gemini API"],
    featured: true,
    category: "AI",
    impact: [
      "Automated extraction of Udemy video transcripts directly from lesson pages.",
      "Integrated Google Gemini for real-time, context-aware video summarization.",
      "Persisted generated summaries using browser local storage for reuse.",
      "Delivered a lightweight browser extension with minimal user interaction.",
    ],
    artifacts: [],
  },
  {
    id: "7",
    slug: "rayso-api",
    title: "Rayso API",
    description: "REST API for generating beautifully styled code screenshots from raw code input.",
    longDescription:
      "Developed a Node.js-based REST API that wraps ray.so functionality to generate customizable code screenshots programmatically. Implemented support for multiple themes, padding, dark/light modes, and language detection through query and body parameters. Designed flexible GET and POST endpoints for easy integration into developer workflows. Leveraged Puppeteer-based rendering and structured deployment for cloud environments like Heroku.",
    image: "/projects/rayso-api.jpg",
    technologies: ["Node.js", "Express", "Puppeteer", "REST API"],
    featured: true,
    category: "Backend",
    impact: [
      "Enabled developers to generate code screenshots programmatically via API.",
      "Abstracted UI-based tooling into a reusable backend service.",
      "Supported customizable rendering options including themes and layout.",
      "Designed for easy deployment and integration into automation workflows.",
    ],
    artifacts: [],
  }
];

export const workExperience: WorkExperience[] = [
  {
    year: "2024",
    role: "Backend Engineer",
    company: "Litmus7 Systems Consulting Pvt Ltd",
    description: "Built secure Spring Boot APIs with Keycloak and Spring Security, and architected ETL and workflow systems using Spring Batch and Temporal.",
    tech: ["Spring Boot", "Keycloak", "MongoDB", "Spring Batch", "Postgres"],
  },
  {
    year: "2023",
    endYear: "2023",
    role: "Back End Developer",
    company: "GTech Mulearn",
    description: "Engineered and maintained Django REST Framework APIs and MySQL-backed data models for core platform workflows.",
    tech: ["Django REST Framework", "MySQL", "Python"],
  },
];

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/akashrchandran" },
  { name: "LinkedIn", url: "https://linkedin.com/in/akashrchandran" },
  { name: "Email", url: "mailto:chandranrakash@gmail.com" },
  { name: "Twitter", url: "https://twitter.com/akas__h" },
];

export const techStack: string[] = [
  "Java",
  "Python",
  "SQL",
  "JavaScript",
  "Spring Boot",
  "Spring Security",
  "Django REST Framework",
  "FastAPI",
  "PostgreSQL",
  "MongoDB",
  "Kafka",
  "Temporal",
  "Docker",
  "GCP",
];

export const focusAreas: string[] = [
  "Building fast, reliable, and secure backend systems",
  "Designing microservices and high-volume data workflows",
  "Reducing database load to improve overall system speed",
  "Automating background processing for resilient operations",
];
