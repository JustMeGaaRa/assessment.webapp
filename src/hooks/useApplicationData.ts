import { useEffect, useState } from "react";
import type {
  AssessmentSessionState,
  AssessorEvaluationState,
  LevelMapping,
  ModuleState,
  ProfileState,
} from "../types";
import { createBackup, type BackupData } from "../utils/backupHelper";

const ASSESSMENT_LIBRARY_KEY = "assessment_matrix_data";
const ASSESSOR_EVALUATIONS_KEY = "assessment_evaluations";
const ASSESSMENT_SESSIONS_KEY = "assessment_groups";

export const useApplicationData = () => {
  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<ModuleState[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).matrix : [];
  });

  const [profiles, setProfiles] = useState<ProfileState[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).profiles : [];
  });

  const [stacks, setStacks] = useState<string[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? Object.values(JSON.parse(saved).stacks) : [];
  });

  const [levelMappings, setLevelMappings] = useState<LevelMapping[]>(() => {
    const saved = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
    return saved ? JSON.parse(saved).levelMappings || [] : [];
  });

  // Persist changes
  useEffect(() => {
    if (matrix.length > 0) {
      localStorage.setItem(
        ASSESSMENT_LIBRARY_KEY,
        JSON.stringify({ matrix, profiles, stacks, levelMappings }),
      );
    }
  }, [matrix, profiles, stacks, levelMappings]);

  // Assessment Groups State
  const [assessments, setAssessments] = useState<AssessmentSessionState[]>(
    () => {
      const saved = localStorage.getItem(ASSESSMENT_SESSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    },
  );

  useEffect(() => {
    localStorage.setItem(ASSESSMENT_SESSIONS_KEY, JSON.stringify(assessments));
  }, [assessments]);

  // Assessment Evaluations State
  const [evaluations, setEvaluations] = useState<AssessorEvaluationState[]>(
    () => {
      const saved = localStorage.getItem(ASSESSOR_EVALUATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    },
  );

  useEffect(() => {
    localStorage.setItem(ASSESSOR_EVALUATIONS_KEY, JSON.stringify(evaluations));
  }, [evaluations]);

  // Assessor Name State
  const [assessorName, setAssessorName] = useState(() => {
    return localStorage.getItem("assessor_name") || "";
  });

  // Persist assessor name
  useEffect(() => {
    localStorage.setItem("assessor_name", assessorName);
  }, [assessorName]);

  const handleDataLoad = (
    m: ModuleState[],
    p: ProfileState[],
    s: string[],
    l?: LevelMapping[],
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    if (l) setLevelMappings(l);
    localStorage.setItem(
      ASSESSMENT_LIBRARY_KEY,
      JSON.stringify({ matrix: m, profiles: p, stacks: s, levelMappings: l || levelMappings }),
    );
  };

  const createAssessment = (assessment: AssessmentSessionState) => {
    setAssessments((prev) => {
      if (prev.some((a) => a.id === assessment.id)) {
        return prev.map((a) => (a.id === assessment.id ? assessment : a));
      }
      return [assessment, ...prev];
    });
  };

  const createEvaluation = (evaluation: AssessorEvaluationState) => {
    setEvaluations((prev) => {
      if (prev.some((e) => e.id === evaluation.id)) {
        return prev.map((e) => (e.id === evaluation.id ? evaluation : e));
      }
      return [evaluation, ...prev];
    });
  };

  const updateAssessment = (
    assessmentId: string,
    assessmentUpdate: Partial<AssessmentSessionState>,
  ) => {
    setAssessments((prev) =>
      prev.map((assessment) =>
        assessment.id === assessmentId
          ? { ...assessment, ...assessmentUpdate }
          : assessment,
      ),
    );
  };

  const updateEvaluation = (
    evaluationId: string,
    evaluationUpdate: Partial<AssessorEvaluationState>,
  ) => {
    setEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, ...evaluationUpdate }
          : evaluation,
      ),
    );
  };

  const backupApplicationState = () => {
    const backup = createBackup(
      { matrix, profiles, stacks },
      assessments,
      evaluations,
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
    setMatrix(data.library.matrix);
    setProfiles(data.library.profiles);
    setStacks(data.library.stacks);
    if (data.library.levelMappings) setLevelMappings(data.library.levelMappings);
    setAssessments(data.assessments);
    setEvaluations(data.evaluations);
    setAssessorName(data.assessorName || "");
  };

  return {
    matrix,
    setMatrix,
    profiles,
    setProfiles,
    stacks,
    setStacks,
    levelMappings,
    setLevelMappings,
    assessments,
    setAssessments,
    evaluations,
    setEvaluations,
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
