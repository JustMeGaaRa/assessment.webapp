import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import type { AssessorEvaluationState, LevelMapping } from "../../types";

interface AssessmentSessionCardProps {
  session: AssessorEvaluationState;
  levelMappings?: LevelMapping[];
}

export const AssessmentSessionCard = ({
  session,
  levelMappings,
}: AssessmentSessionCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: AssessorEvaluationState["status"]) => {
    switch (status) {
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-amber-600 bg-amber-50";
    }
  };

  const getStatusIcon = (status: AssessorEvaluationState["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div
      onClick={() =>
        navigate(`/assessment/${session.assessmentId ?? session.id}`)
      }
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group min-h-[220px] flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(session.status)}`}
          >
            {getStatusIcon(session.status)}
            {session.status}
          </div>
          <div className="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ClipboardList size={12} />
            Assessment
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

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
    </div>
  );
};
