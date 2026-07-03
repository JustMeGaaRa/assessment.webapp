import { useRouter } from "next/navigation";
import { Calendar, MessageSquareText } from "lucide-react";
import type { IndividualAssessmentScore, Profile } from "../../lib/matrix/types";
import { calculateIndividualScore } from "../../lib/matrix/assessmentHelper";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface AssessmentEvaluationCardProps {
  evalSession: IndividualAssessmentScore;
  assessmentId?: string;
  profile?: Profile;
}

export const AssessmentEvaluationCard = ({
  evalSession,
  assessmentId,
  profile,
}: AssessmentEvaluationCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (assessmentId) {
      router.push(`/assessment/${assessmentId}/evaluation/${evalSession.feedbackId}`);
    } else {
      console.warn("No assessment ID found for navigation");
    }
  };

  const finalScore =
    profile
      ? calculateIndividualScore(profile, evalSession)
      : undefined;

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
          {evalSession.assessor.fullname || "Unknown Assessor"}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={14} />
          <span>{evalSession.date ? new Date(evalSession.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
        </div>
      </Card.Body>

      {finalScore !== undefined && (
        <Card.Footer className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Score
          </span>
          <span className="text-xl font-black text-indigo-600">
            {finalScore?.toFixed(1)}
          </span>
        </Card.Footer>
      )}
    </Card>
  );
};
