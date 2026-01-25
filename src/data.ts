// Available Technology Stacks
export const STACKS = {
  DOTNET: ".NET",
  ANGULAR: "Angular",
  REACT: "React"
};

interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  weight: number;
  mappings: Record<string, string>;
}

interface Profile {
  id: string;
  title: string;
  stack: string;
  description: string;
  weights: Record<string, number>;
}

// Assessment Matrix: Single Source of Truth
export const ASSESSMENT_MATRIX: Module[] = [
  {
    id: "mod-core",
    title: "Core Coding",
    description: "Fundamental programming concepts and languages.",
    topics: [
      {
        id: "t-lang",
        name: "Programming Language",
        weight: 3,
        mappings: {
          ".NET": "C# (v12+ features)",
          "Angular": "TypeScript (Advanced Types)",
          "React": "JavaScript (ES6+) / TypeScript",
        },
      },
      {
        id: "t-async",
        name: "Asynchronous Programming",
        weight: 3,
        mappings: {
          ".NET": "Task / Async / Await / Threading",
          "Angular": "RxJS Observables / Operators",
          "React": "Promises / Async / Await",
        },
      },
       {
        id: "t-mem",
        name: "Memory Management",
        weight: 2,
        mappings: {
          ".NET": "IDisposable / Garbage Collection",
          "Angular": "Subscription Cleanup / Memory Leaks",
          "React": "Cleanup Functions / Memoization",
        },
      },
    ],
  },
  {
    id: "mod-quality",
    title: "Code Quality",
    description: "Testing, linting, and best practices.",
    topics: [
      {
        id: "t-test",
        name: "Testing Framework",
        weight: 3,
        mappings: {
          ".NET": "xUnit / NUnit / Moq",
          "Angular": "Jasmine / Karma / Vitest",
          "React": "Jest / React Testing Library",
        },
      },
      {
        id: "t-lint",
        name: "Linting & Formatting",
        weight: 2,
        mappings: {
          ".NET": "StyleCop / .editorconfig",
          "Angular": "ESLint / Prettier",
          "React": "ESLint / Prettier",
        },
      },
    ],
  },
  {
    id: "mod-web",
    title: "Web Fundamentals",
    description: "Core web technologies and browser behavior.",
    topics: [
      {
        id: "t1",
        name: "Semantic HTML & Accessibility",
        weight: 1,
        mappings: {
          ".NET": "Razor Pages / Blazor Accessibility",
          "Angular": "Angular A11y CDK",
          "React": "JSX A11y / Aria Props",
        },
      },
      {
        id: "t2",
        name: "CSS Architecture",
        weight: 1,
        mappings: {
            ".NET": "CSS Isolation / SASS",
            "Angular": "View Encapsulation / SCSS",
            "React": "CSS Modules / Styled Components",
        },
      },
      {
        id: "t3",
        name: "DOM Manipulation",
        weight: 2,
        mappings: {
          ".NET": "Blazor DOM Interop",
          "Angular": "ElementRef / Renderer2",
          "React": "Refs / Virtual DOM",
        },
      },
    ],
  },
  {
    id: "mod-arch",
    title: "System Architecture",
    description: "Scalability, patterns, and best practices.",
    topics: [
      {
        id: "t-api",
        name: "API Design",
        weight: 3,
        mappings: {
          ".NET": "ASP.NET Core Web API / Minimal APIs",
          "Angular": "HttpClient / Interceptors",
          "React": "Fetch / Axios / React Query",
        },
      },
      {
        id: "t-state",
        name: "State Management",
        weight: 3,
        mappings: {
          ".NET": "In-Memory Cache / Distributed Cache",
          "Angular": "NgRx / Signals / Services",
          "React": "Redux / Context API / Zustand",
        },
      },
    ],
  },
];

// Profiles Definition
export const PROFILES: Profile[] = [
  {
    id: "p-net-mid",
    title: "Mid-Level .NET Developer",
    stack: ".NET",
    description: "Focus on core C# proficiency, basic API understanding, and solid testing habits.",
    weights: {
      "mod-core": 40,
      "mod-quality": 30,
      "mod-web": 10,
      "mod-arch": 20,
    }
  },
  {
    id: "p-net-senior",
    title: "Senior .NET Developer",
    stack: ".NET",
    description: "Deep knowledge of architecture, memory management, and advanced asynchronous patterns.",
    weights: {
      "mod-core": 30,
      "mod-quality": 20,
      "mod-web": 10,
      "mod-arch": 40,
    }
  },
   {
    id: "p-ang-mid",
    title: "Mid-Level Angular Developer",
    stack: "Angular",
    description: "Strong grasp of components, RxJS basics, and standard Angular CLI tools.",
    weights: {
      "mod-core": 30,
      "mod-quality": 30,
      "mod-web": 20,
      "mod-arch": 20,
    }
  },
  {
    id: "p-ang-senior",
    title: "Senior Angular Developer",
    stack: "Angular",
    description: "Expertise in performance tuning, complex state management (NgRx), and architectural patterns.",
    weights: {
      "mod-core": 25,
      "mod-quality": 20,
      "mod-web": 15,
      "mod-arch": 40,
    }
  }
];
