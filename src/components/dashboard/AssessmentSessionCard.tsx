import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { AssessmentSession } from "../../types";

interface AssessmentSessionCardProps {
  session: AssessmentSession;
}

export const AssessmentSessionCard = ({
  session,
}: AssessmentSessionCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: AssessmentSession["status"]) => {
    switch (status) {
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-amber-600 bg-amber-50";
    }
  };

  const getStatusIcon = (status: AssessmentSession["status"]) => {
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
      onClick={() => navigate(`/assessment/${session.id}`)}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(session.status)}`}
          >
            {getStatusIcon(session.status)}
            {session.status}
          </div>
          {session.status === "completed" &&
            session.finalScore !== undefined && (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100">
                <span className="text-[10px]">Score:</span>
                <span className="text-[10px]">
                  {session.finalScore.toFixed(1)}
                </span>
              </div>
            )}
        </div>
        <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-1">
        {session.candidateName}
      </h3>

      <div className="space-y-2.5 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-slate-400" />
          <span className="font-medium">{session.stack}</span>
          <span className="text-slate-300">•</span>
          <span>{session.profileTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
