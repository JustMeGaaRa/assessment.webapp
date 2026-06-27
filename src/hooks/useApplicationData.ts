import { useEffect, useState } from "react";
import type {
  AssessmentSessionState,
  AssessorFeedbackState,
  ProficiencyLevelState,
  ModuleState,
  ProfileState,
} from "../types";
import { createBackup, type BackupData } from "../utils/backupHelper";

const ASSESSMENT_LIBRARY_KEY = "assessment_matrix_data";
const ASSESSOR_EVALUATIONS_KEY = "assessment_evaluations";
const ASSESSMENT_SESSIONS_KEY = "assessment_groups";

export const useApplicationData = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Master Data State with Persistence
  const [matrix, setMatrix] = useState<ModuleState[]>([]);
  const [profiles, setProfiles] = useState<ProfileState[]>([]);
  const [stacks, setStacks] = useState<string[]>([]);
  const [levelMappings, setLevelMappings] = useState<ProficiencyLevelState[]>(
    [],
  );

  // Assessment Groups State
  const [assessments, setAssessments] = useState<AssessmentSessionState[]>([]);

  // Assessment Evaluations State
  const [evaluations, setEvaluations] = useState<AssessorFeedbackState[]>([]);

  // Assessor Name State
  const [assessorName, setAssessorName] = useState("");

  // Load state from localStorage once mounted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLibrary = localStorage.getItem(ASSESSMENT_LIBRARY_KEY);
      if (savedLibrary) {
        try {
          const parsed = JSON.parse(savedLibrary);
          if (parsed.matrix) setMatrix(parsed.matrix);
          if (parsed.profiles) setProfiles(parsed.profiles);
          if (parsed.stacks) {
            setStacks(
              Array.isArray(parsed.stacks)
                ? parsed.stacks
                : Object.values(parsed.stacks),
            );
          }
          if (parsed.levelMappings) setLevelMappings(parsed.levelMappings);
        } catch (e) {
          console.error("Error parsing saved library", e);
        }
      }

      const savedSessions = localStorage.getItem(ASSESSMENT_SESSIONS_KEY);
      if (savedSessions) {
        try {
          setAssessments(JSON.parse(savedSessions));
        } catch (e) {
          console.error("Error parsing saved sessions", e);
        }
      }

      const savedEvaluations = localStorage.getItem(ASSESSOR_EVALUATIONS_KEY);
      if (savedEvaluations) {
        try {
          setEvaluations(JSON.parse(savedEvaluations));
        } catch (e) {
          console.error("Error parsing saved evaluations", e);
        }
      }

      const savedName = localStorage.getItem("assessor_name");
      if (savedName) {
        setAssessorName(savedName);
      }

      setIsLoaded(true);
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(
      ASSESSMENT_LIBRARY_KEY,
      JSON.stringify({ matrix, profiles, stacks, levelMappings }),
    );
  }, [matrix, profiles, stacks, levelMappings, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(ASSESSMENT_SESSIONS_KEY, JSON.stringify(assessments));
  }, [assessments, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(ASSESSOR_EVALUATIONS_KEY, JSON.stringify(evaluations));
  }, [evaluations, isLoaded]);

  // Persist assessor name
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem("assessor_name", assessorName);
  }, [assessorName, isLoaded]);

  const handleDataLoad = (
    m: ModuleState[],
    p: ProfileState[],
    s: string[],
    l?: ProficiencyLevelState[],
  ) => {
    setMatrix(m);
    setProfiles(p);
    setStacks(s);
    if (l) setLevelMappings(l);
    localStorage.setItem(
      ASSESSMENT_LIBRARY_KEY,
      JSON.stringify({
        matrix: m,
        profiles: p,
        stacks: s,
        levelMappings: l || levelMappings,
      }),
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

  const createEvaluation = (evaluation: AssessorFeedbackState) => {
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
    evaluationUpdate: Partial<AssessorFeedbackState>,
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
    if (data.library.levelMappings)
      setLevelMappings(data.library.levelMappings);
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
