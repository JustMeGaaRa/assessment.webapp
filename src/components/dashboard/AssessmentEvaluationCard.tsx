import { useNavigate } from "react-router-dom";
import { Calendar, MessageSquareText } from "lucide-react";
import type { AssessorEvaluationState } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface AssessmentEvaluationCardProps {
  evalSession: AssessorEvaluationState;
  assessmentId?: string;
}

export const AssessmentEvaluationCard = ({
  evalSession,
  assessmentId,
}: AssessmentEvaluationCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const groupId = assessmentId || evalSession.assessmentId;
    if (groupId) {
      navigate(`/assessment/${groupId}/evaluation/${evalSession.id}`);
    } else {
      console.warn("No assessment ID found for navigation");
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="min-h-[220px] flex flex-col"
    >
      <Card.Header>
        <div className="flex gap-2">
          <Badge status={evalSession.status} />
          <Badge icon={<MessageSquareText size={12} />}>Feedback</Badge>
        </div>
      </Card.Header>

      <Card.Body className="flex-1 pt-0">
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {evalSession.assessorName || "Unknown Assessor"}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={14} />
          <span>{new Date(evalSession.date).toLocaleDateString()}</span>
        </div>
      </Card.Body>

      {evalSession.finalScore !== undefined && (
        <Card.Footer className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">Score</span>
          <span className="text-xl font-black text-indigo-600">
            {evalSession.finalScore.toFixed(1)}
          </span>
        </Card.Footer>
      )}
    </Card>
  );
};
