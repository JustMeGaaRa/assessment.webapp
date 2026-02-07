import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, Calendar, MessageSquareText } from "lucide-react";
import type { AssessorEvaluationState } from "../../types";

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
    // If assessmentId is passed, use it, otherwise use session.assessmentId
    const groupId = assessmentId || evalSession.assessmentId;
    if (groupId) {
      navigate(`/assessment/${groupId}/evaluation/${evalSession.id}`);
    } else {
      console.warn("No assessment ID found for navigation");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="flex items-start mb-4">
          <div className="flex gap-2">
            <div
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                evalSession.status === "completed"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-amber-600 bg-amber-50"
              }`}
            >
              {evalSession.status === "completed" ? (
                <CheckCircle2 size={12} />
              ) : (
                <Clock size={12} />
              )}
              {evalSession.status}
            </div>
          </div>
          <div className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 self-center">
            <MessageSquareText size={12} />
            Feedback
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {evalSession.assessorName || "Unknown Assessor"}
        </h3>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar size={14} />
          <span>{new Date(evalSession.date).toLocaleDateString()}</span>
        </div>
      </div>

      {evalSession.finalScore !== undefined && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase">
            Score
          </span>
          <span className="text-xl font-black text-indigo-600">
            {evalSession.finalScore.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
};
