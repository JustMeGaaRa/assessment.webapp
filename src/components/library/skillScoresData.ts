import type { SkillScore } from "../../types";
import { BookOpen, Zap, Shield, Star, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export interface ScoreStyle {
  gradient: string;
  border: string;
  text: string;
  bg: string;
  badge: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  shadow: string;
}

// Component color, icon, and background styles for each score
export const scoreStyles: Record<number, ScoreStyle> = {
  1: {
    gradient: "from-rose-500 to-pink-500",
    border: "border-rose-100 group-hover:border-rose-300",
    text: "text-rose-600",
    bg: "bg-rose-50/50",
    badge: "bg-rose-100 text-rose-800",
    icon: BookOpen,
    shadow: "hover:shadow-rose-100",
  },
  2: {
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-100 group-hover:border-amber-300",
    text: "text-amber-600",
    bg: "bg-amber-50/50",
    badge: "bg-amber-100 text-amber-800",
    icon: Zap,
    shadow: "hover:shadow-amber-100",
  },
  3: {
    gradient: "from-emerald-500 to-teal-500",
    border: "border-emerald-100 group-hover:border-emerald-300",
    text: "text-emerald-600",
    bg: "bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-800",
    icon: Shield,
    shadow: "hover:shadow-emerald-100",
  },
  4: {
    gradient: "from-blue-500 to-indigo-500",
    border: "border-blue-100 group-hover:border-blue-300",
    text: "text-blue-600",
    bg: "bg-blue-50/50",
    badge: "bg-blue-100 text-blue-800",
    icon: Star,
    shadow: "hover:shadow-blue-100",
  },
  5: {
    gradient: "from-purple-500 to-violet-600",
    border: "border-purple-200 group-hover:border-purple-400",
    text: "text-purple-600",
    bg: "bg-purple-50/50",
    badge: "bg-purple-100 text-purple-800",
    icon: Sparkles,
    shadow: "hover:shadow-purple-100",
  },
};

export const dummySkillScores: SkillScore[] = [
  {
    score: 1,
    label: "Novice",
    description:
      "Has basic awareness and initial theoretical understanding of the technology stack.",
    criteria:
      "• Understands basic terms and syntax\n• Requires constant, detailed instruction to complete tasks\n• Limited hands-on implementation experience\n• Relies heavily on external resources or templates for simple outputs",
  },
  {
    score: 2,
    label: "Beginner",
    description:
      "Possesses practical familiarity with foundational principles and basic configurations.",
    criteria:
      "• Can execute routine, isolated tasks independently\n• Understands the configuration structure and basic project setup\n• Needs guidance for styling, API connections, and state management\n• Learns actively under regular supervision or mentorship",
  },
  {
    score: 3,
    label: "Competent",
    description:
      "Can autonomously build standard features, solve general issues, and produce quality work.",
    criteria:
      "• Builds features autonomously following established patterns\n• Troubleshoots standard logical issues and errors independently\n• Demonstrates a clean coding style with modular structures\n• Contributes effectively to daily team discussions and reviews",
  },
  {
    score: 4,
    label: "Proficient",
    description:
      "Demonstrates advanced comprehension, clean feature design, and active team leadership.",
    criteria:
      "• Designs and structures complex components and modules\n• Optimizes application code for performance and reliability\n• Mentors junior engineers and conducts detailed code reviews\n• Actively introduces best practices and helps define conventions",
  },
  {
    score: 5,
    label: "Expert",
    description:
      "Exhibits complete technical mastery, pioneering strategic vision, and deep system architecture skills.",
    criteria:
      "• Architects large-scale scalable systems and patterns from scratch\n• Solves highly complex, critical engineering bottlenecks and security challenges\n• Shapes technical direction, framework selection, and long-term stack decisions\n• Serves as the key domain authority and influences engineering excellence",
  },
];
