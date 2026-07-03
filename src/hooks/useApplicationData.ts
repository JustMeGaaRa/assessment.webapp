import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AssessmentSession,
  CompetenceMatrix,
  ProficiencyLevel,
  Profile,
  SkillLevel,
  IndividualAssessmentScore,
} from "@lib/matrix/types";
import { AppDataStateV1 } from "@lib/state/v1/types";
import { getApplicationState } from "@lib/state/v2/mappers";
import { createBackup, type BackupData } from "../utils/backupHelper";
import { AppDataStateV2 } from "@lib/state/v2/types";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function loadInitialState() {
  if (typeof window === "undefined") {
    return {
      matrix: { modules: [], stacks: [] },
      profiles: [],
      proficiencyLevels: [],
      skillLevels: [],
      assessments: [],
      assessorName: "",
    };
  }

  const savedStateV2 = localStorage.getItem("assessment_state_v2");
  if (savedStateV2) {
    try {
      const parsed = JSON.parse(savedStateV2);
      if (parsed.version === 2) {
        const assessments: AssessmentSession[] = (parsed.assessments || []).map((a: AssessmentSession) => ({
          ...a,
          details: {
            ...a.details,
            date: new Date(a.details.date),
          },
          feedbacks: (a.feedbacks || []).map((f: IndividualAssessmentScore) => ({
            ...f,
            date: f.date ? new Date(f.date) : undefined,
          })),
        }));
        return {
          matrix: parsed.matrix || { modules: [], stacks: [] },
          profiles: parsed.profiles || [],
          proficiencyLevels: parsed.proficiencyLevels || [],
          skillLevels: parsed.skillLevels || [],
          assessments,
          assessorName: localStorage.getItem("assessor_name") || "",
        };
      }
    } catch (e) {
      console.error("Error parsing saved v2 state", e);
    }
  }

  // Fallback V1 keys migration
  const savedLibrary = localStorage.getItem("assessment_matrix_data");
  const savedSessions = localStorage.getItem("assessment_groups");
  const savedEvaluations = localStorage.getItem("assessment_evaluations");

  if (savedLibrary || savedSessions || savedEvaluations) {
    try {
      const libraryParsed = savedLibrary ? JSON.parse(savedLibrary) : {};
      const assessmentsParsed = savedSessions ? JSON.parse(savedSessions) : [];
      const evaluationsParsed = savedEvaluations ? JSON.parse(savedEvaluations) : [];

      const appStateV1: AppDataStateV1 = {
        version: 1,
        timestamp: new Date(),
        library: {
          matrix: libraryParsed.matrix || [],
          profiles: libraryParsed.profiles || [],
          stacks: libraryParsed.stacks || [],
          levelMappings: libraryParsed.levelMappings || [],
        },
        assessments: assessmentsParsed,
        evaluations: evaluationsParsed,
      };

      const appStateV2 = getApplicationState(appStateV1);
      
      // Persist the migrated V2 state
      localStorage.setItem("assessment_state_v2", JSON.stringify(appStateV2));

      // Clean up the V1 keys
      localStorage.removeItem("assessment_matrix_data");
      localStorage.removeItem("assessment_groups");
      localStorage.removeItem("assessment_evaluations");

      return {
        matrix: appStateV2.matrix,
        profiles: appStateV2.profiles,
        proficiencyLevels: appStateV2.proficiencyLevels,
        skillLevels: appStateV2.skillLevels,
        assessments: appStateV2.assessments,
        assessorName: localStorage.getItem("assessor_name") || "",
      };
    } catch (e) {
      console.error("Error migrating state from v1 to v2", e);
    }
  }

  return {
    matrix: { modules: [], stacks: [] },
    profiles: [],
    proficiencyLevels: [],
    skillLevels: [],
    assessments: [],
    assessorName: localStorage.getItem("assessor_name") || "",
  };
}

export const useApplicationData = () => {
  const [initialData] = useState(() => loadInitialState());
  const mounted = useMounted();

  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<CompetenceMatrix>(initialData.matrix);
  const [profiles, setProfiles] = useState<Profile[]>(initialData.profiles);
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>(initialData.proficiencyLevels);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>(initialData.skillLevels);

  // Assessment Sessions State
  const [assessments, setAssessments] = useState<AssessmentSession[]>(initialData.assessments);

  // Assessor Name State
  const [assessorName, setAssessorName] = useState(initialData.assessorName);

  // Persist changes
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const stateV2: AppDataStateV2 = {
      version: 2,
      timestamp: new Date(),
      matrix,
      profiles,
      proficiencyLevels,
      skillLevels,
      assessments,
    };
    localStorage.setItem("assessment_state_v2", JSON.stringify(stateV2));
  }, [matrix, profiles, proficiencyLevels, skillLevels, assessments, mounted]);

  // Persist assessor name
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    localStorage.setItem("assessor_name", assessorName);
  }, [assessorName, mounted]);

  const handleDataLoad = (
    m: CompetenceMatrix,
    p: Profile[],
    l: ProficiencyLevel[],
    s?: SkillLevel[],
  ) => {
    setMatrix(m);
    setProfiles(p);
    setProficiencyLevels(l);
    if (s) setSkillLevels(s);
  };

  const createAssessment = (assessment: AssessmentSession) => {
    setAssessments((prev) => {
      if (prev.some((a) => a.assessmentId === assessment.assessmentId)) {
        return prev.map((a) => (a.assessmentId === assessment.assessmentId ? assessment : a));
      }
      return [assessment, ...prev];
    });
  };

  const createEvaluation = (assessmentId: string, evaluation: IndividualAssessmentScore) => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.assessmentId === assessmentId
          ? {
              ...a,
              feedbacks: a.feedbacks.some((f) => f.feedbackId === evaluation.feedbackId)
                ? a.feedbacks.map((f) => (f.feedbackId === evaluation.feedbackId ? evaluation : f))
                : [...a.feedbacks, evaluation],
            }
          : a
      )
    );
  };

  const updateAssessment = (
    assessmentId: string,
    assessmentUpdate: Partial<AssessmentSession>,
  ) => {
    setAssessments((prev) =>
      prev.map((assessment) =>
        assessment.assessmentId === assessmentId
          ? {
              ...assessment,
              ...assessmentUpdate,
              details: assessmentUpdate.details
                ? { ...assessment.details, ...assessmentUpdate.details }
                : assessment.details,
            }
          : assessment,
      ),
    );
  };

  const updateEvaluation = (
    evaluationId: string,
    evaluationUpdate: Partial<IndividualAssessmentScore>,
  ) => {
    setAssessments((prev) =>
      prev.map((a) => {
        if (a.feedbacks.some((f) => f.feedbackId === evaluationId)) {
          return {
            ...a,
            feedbacks: a.feedbacks.map((f) =>
              f.feedbackId === evaluationId
                ? { ...f, ...evaluationUpdate }
                : f
            ),
          };
        }
        return a;
      })
    );
  };

  const backupApplicationState = () => {
    const backup = createBackup(
      matrix,
      proficiencyLevels,
      profiles,
      skillLevels,
      assessments,
      assessorName,
    );
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreApplicationState = (data: BackupData) => {
    setMatrix(data.matrix);
    setProfiles(data.profiles);
    setProficiencyLevels(data.proficiencyLevels);
    setSkillLevels(data.skillLevels);
    setAssessments(data.assessments);
    setAssessorName(data.assessorName || "");
  };

  return {
    matrix,
    setMatrix,
    profiles,
    setProfiles,
    proficiencyLevels,
    setProficiencyLevels,
    skillLevels,
    setSkillLevels,
    assessments,
    setAssessments,
    assessorName,
    setAssessorName,
    handleDataLoad,
    createAssessment,
    createEvaluation,
    updateAssessment,
    updateEvaluation,
    backupApplicationState,
    restoreApplicationState,
  };
};
