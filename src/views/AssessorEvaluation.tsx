import { useState } from "react";
import {
  CheckCircle,
  FileText,
  Library,
  ArrowLeft,
  Download,
  RotateCcw,
  Lock,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AssessmentEvaluationStats } from "@/components/assessment/AssessmentStats";
import { AssessmentModule } from "@/components/assessment/AssessmentModule";
import { PageHeader } from "@/components/ui/PageHeader";
import { useRouter } from "next/navigation";
import { exportSessionToJSON } from "@/utils/fileHelpers";
import {
  calculateAssessorFeedbackScore,
  CompetenceMatrix,
  CompetenceMatrixModule,
  Profile,
  IndividualAssessmentScore,
} from "@lib/matrix";
import {
  dummySkillScores,
  scoreStyles,
} from "@/components/library/skillScoresData";

interface AssessorEvaluationPageProps {
  evaluation: IndividualAssessmentScore;
  modules: CompetenceMatrix;
  profile: Profile;
  onUpdate: (data: Partial<IndividualAssessmentScore>) => void;
  isLocked?: boolean;
  candidateName: string;
  stack: string;
}

export const AssessorEvaluationPage = ({
  evaluation,
  modules,
  profile,
  onUpdate,
  isLocked = false,
  candidateName,
  stack,
}: AssessorEvaluationPageProps) => {
  const router = useRouter();

  // Initialize with first module expanded if available
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    return modules.modules.length > 0
      ? new Set([modules.modules[0].moduleId])
      : new Set();
  });
  const [showReference, setShowReference] = useState(true);

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedModules(newSet);
  };

  const handleScore = (topicName: string, score: number) => {
    if (isLocked) return;
    const updatedModules = evaluation.modules.map((m) => {
      if (m.topics.some((t) => t.topicName === topicName)) {
        return {
          ...m,
          topics: m.topics.map((t) =>
            t.topicName === topicName ? { ...t, score } : t
          ),
        };
      }
      return m;
    });
    onUpdate({ modules: updatedModules });
  };

  const handleNote = (topicName: string, note: string) => {
    if (isLocked) return;
    const updatedModules = evaluation.modules.map((m) => {
      if (m.topics.some((t) => t.topicName === topicName)) {
        return {
          ...m,
          topics: m.topics.map((t) =>
            t.topicName === topicName ? { ...t, notes: note } : t
          ),
        };
      }
      return m;
    });
    onUpdate({ modules: updatedModules });
  };

  const resetAssessment = () => {
    if (isLocked) return;
    if (window.confirm("Are you sure you want to clear all scores?")) {
      const resetModules = evaluation.modules.map((m) => ({
        ...m,
        topics: m.topics.map((t) => ({ ...t, score: 0, notes: "" })),
      }));
      onUpdate({
        modules: resetModules,
      });
    }
  };

  const finishAssessment = () => {
    if (isLocked) return;
    if (window.confirm("Mark this assessment as completed?")) {
      onUpdate({
        status: "completed",
      });
    }
  };

  const handleExportJSON = () => {
    exportSessionToJSON(evaluation);
  };

  const getScoredTopicsInModule = (module: CompetenceMatrixModule) => {
    const evalModule = evaluation.modules.find(
      (m) => m.moduleId === module.moduleId
    );
    return evalModule
      ? evalModule.topics.filter((topic) => topic.score > 0).length
      : 0;
  };

  const stats = calculateAssessorFeedbackScore(
    profile,
    evaluation.assessor.fullname ?? "Anonymous",
    evaluation.modules,
  );

  const evaluationStats = {
    totalScore: stats.weightedScore,
    completedTopics: modules.modules.reduce(
      (total, module) => total + getScoredTopicsInModule(module),
      0,
    ),
    totalTopics: modules.modules.reduce(
      (total, module) => total + module.topics.length,
      0,
    ),
  };

  const isReadOnly =
    isLocked ||
    evaluation.status === "completed" ||
    evaluation.status === "rejected";

  const scoresMap = evaluation.modules
    .flatMap((m) => m.topics)
    .reduce<Record<string, number>>((acc, curr) => ({ ...acc, [curr.topicName]: curr.score }), {});

  const notesMap = evaluation.modules
    .flatMap((m) => m.topics)
    .reduce<Record<string, string>>((acc, curr) => ({ ...acc, [curr.topicName]: curr.notes }), {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 pb-32 md:pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-semibold group"
            >
              <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
                <ArrowLeft size={20} />
              </div>
              <span className="hidden sm:inline">Back to Assessment</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLocked && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold shadow-sm"
                title="You cannot edit this evaluation."
              >
                <Lock size={14} />
                <span>Read Only</span>
              </div>
            )}

            <div className="flex gap-1 items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3 py-1.5 text-slate-600 font-bold hover:text-indigo-600 transition-all text-xs"
                title="Export JSON Backup"
              >
                <Download size={14} />
                <span className="hidden sm:inline">JSON Export</span>
              </button>
            </div>

            <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>
            <button
              onClick={() => router.push("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <Library size={18} />
              <span className="hidden sm:inline">View Library</span>
            </button>
          </div>
        </div>
        <PageHeader
          icon={
            isLocked ? (
              <Lock className="text-amber-500 w-8 h-8" />
            ) : (
              <FileText className="text-indigo-600 w-8 h-8" />
            )
          }
          title="Assessment Evaluation"
          description={
            isLocked
              ? "Viewing peer assessment (Read Only)"
              : "Evaluate candidate technical competencies."
          }
        />

        <AssessmentEvaluationStats
          candidate={candidateName}
          assessorName={evaluation.assessor.fullname ?? "Unknown"}
          date={evaluation.date ? evaluation.date.toISOString() : new Date().toISOString()}
          profile={profile.profileName}
          stack={stack}
          stats={evaluationStats}
        />

        <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <button
            onClick={() => setShowReference(!showReference)}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Info size={18} className="text-indigo-600" />
              <span className="font-bold text-sm text-slate-700">
                Evaluation Rubric Reference
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              <span>{showReference ? "Hide Reference" : "Show Reference"}</span>
              {showReference ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </button>

          {showReference && (
            <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                {dummySkillScores.map((skill) => {
                  const style = scoreStyles[skill.score] || scoreStyles[1];
                  const Icon = style.icon;
                  return (
                    <div
                      key={skill.score}
                      className="border border-slate-100 rounded-xl p-3 bg-white flex flex-col relative overflow-hidden shadow-xs hover:shadow-sm transition-all group"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`}
                      />
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${style.badge}`}
                          >
                            {skill.score}
                          </span>
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {skill.label}
                          </span>
                        </div>
                        <span
                          className={`${style.text} opacity-60 group-hover:opacity-100 transition-opacity`}
                        >
                          <Icon size={12} />
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {skill.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.modules.map((module) => {
            const isExpanded = expandedModules.has(module.moduleId);
            const completedTopics = getScoredTopicsInModule(module);
            const totalTopics = module.topics.length;
            const moduleStats = {
              completed: completedTopics,
              total: totalTopics,
            };

            return (
              <AssessmentModule
                key={module.moduleId}
                module={module}
                matrix={modules}
                isExpanded={isExpanded}
                stats={moduleStats}
                onToggle={toggleModule}
                selectedStack={stack}
                scores={scoresMap}
                notes={notesMap}
                onScore={handleScore}
                onNote={handleNote}
                isReadOnly={isReadOnly}
              />
            );
          })}
        </div>

        {/* Action Bar */}
        {!isLocked && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8 pointer-events-none">
            <div className="max-w-7xl mx-auto pointer-events-auto">
              <footer className="flex justify-between p-6 bg-slate-800 rounded-2xl text-white shadow-2xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/95">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-slate-400 text-sm font-medium">
                      Final Evaluation Status
                    </p>
                  </div>
                  <h3 className="text-xl font-bold">
                    {evaluationStats.completedTopics ===
                    evaluationStats.totalTopics
                      ? "Assessment Ready for Submission"
                      : `${
                          evaluationStats.totalTopics -
                          evaluationStats.completedTopics
                        } Topics Remaining`}
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={
                      evaluation.status === "completed" ||
                      evaluation.status === "rejected"
                    }
                    onClick={resetAssessment}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100 border border-slate-600 flex items-center gap-2"
                    title="Reset Assessment"
                  >
                    <RotateCcw size={18} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <button
                    disabled={
                      evaluation.status === "completed" ||
                      evaluation.status === "rejected"
                    }
                    onClick={finishAssessment}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:active:scale-100 flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    <span className="hidden sm:inline">
                      {evaluation.status === "completed"
                        ? "Completed"
                        : "Complete"}
                    </span>
                  </button>
                </div>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
