import { useRouter } from "next/navigation";
import {
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import type {
  AssessmentSession,
  ProficiencyLevel,
  Profile,
} from "../../lib/matrix/types";
import { calculateIndividualScore } from "../../lib/matrix/assessmentHelper";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface AssessmentSessionCardProps {
  assessment: AssessmentSession;
  levelMappings?: ProficiencyLevel[];
  hostId?: string;
  profiles?: Profile[];
}

export const AssessmentSessionCard = ({
  assessment,
  levelMappings,
  hostId,
  profiles,
}: AssessmentSessionCardProps) => {
  const router = useRouter();

  const completed = assessment.feedbacks.filter((f) => f.status === "completed");
  const isCompleted =
    assessment.feedbacks.length > 0 &&
    assessment.feedbacks.every((f) => f.status === "completed");

  const profile = profiles?.find(
    (p) => p.profileId === assessment.details.profile.profileId
  );
  const totalScore = completed.reduce(
    (acc, curr) =>
      acc + (profile ? calculateIndividualScore(profile, curr) : 0),
    0
  );
  const avgScore = completed.length > 0 ? totalScore / completed.length : undefined;

  const status = isCompleted ? "completed" : "ongoing";

  return (
    <Card
      hoverable
      onClick={() => {
        const url = `/assessment/${assessment.assessmentId}${
          hostId ? `?s=${hostId}` : ""
        }`;
        router.push(url);
      }}
      className="min-h-[220px] flex flex-col"
    >
      <Card.Header>
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge status={status} />
            <Badge icon={<ClipboardList size={12} />}>Assessment</Badge>
          </div>
          <ChevronRight
            size={20}
            className="text-slate-300 group-hover:text-indigo-500 transition-colors"
          />
        </div>
      </Card.Header>

      <Card.Body className="flex-1 pt-0">
        <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">
          {assessment.details.candidate.fullname}
        </h3>

        <div className="space-y-2.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span>{new Date(assessment.details.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-400" />
            {status === "completed" &&
            avgScore !== undefined &&
            levelMappings &&
            levelMappings.length > 0 ? (
              <span>
                {levelMappings
                  .sort((a, b) => b.scoreThreshold - a.scoreThreshold)
                  .find((l) => avgScore >= l.scoreThreshold)?.title || "N/A"}
                <span className="mx-1.5 text-slate-300">•</span>
                {assessment.details.profile.title}
              </span>
            ) : (
              <span>{assessment.details.profile.title}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-400" />
            <span>{assessment.details.stack}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
