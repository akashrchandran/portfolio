export interface ProjectArtifact {
  label: string;
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
];
