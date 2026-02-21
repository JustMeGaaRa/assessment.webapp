import { useNavigate } from "react-router-dom";
import { Calendar, Layers, ChevronRight, ShieldCheck, ClipboardList } from "lucide-react";
import type { AssessorEvaluationState, LevelMapping } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface AssessmentSessionCardProps {
  session: AssessorEvaluationState;
  levelMappings?: LevelMapping[];
}

export const AssessmentSessionCard = ({
  session,
  levelMappings,
}: AssessmentSessionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/assessment/${session.assessmentId ?? session.id}`)}
      className="min-h-[220px] flex flex-col"
    >
      <Card.Header>
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge status={session.status} />
            <Badge icon={<ClipboardList size={12} />}>Assessment</Badge>
          </div>
          <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </Card.Header>

      <Card.Body className="flex-1 pt-0">
        <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">
          {session.candidateName}
        </h3>

        <div className="space-y-2.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span>{new Date(session.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-400" />
            {session.status === "completed" && session.finalScore !== undefined && levelMappings && levelMappings.length > 0 ? (
              <span>
                {levelMappings.find(
                  (l) =>
                    session.finalScore! >= l.minScore &&
                    session.finalScore! < l.maxScore,
                )?.level || "N/A"}
                <span className="mx-1.5 text-slate-300">•</span>
                {session.profileTitle}
              </span>
            ) : (
              <span>{session.profileTitle}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-400" />
            <span>{session.stack}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
