"use client";

import React, { createContext, useContext, useState } from "react";
import { useApplicationData } from "../hooks/useApplicationData";
import { usePeerSession, type PeerSessionState } from "../hooks/usePeerSession";
import type {
  AssessmentSessionState,
  AssessorFeedbackState,
  ModuleState,
  ProfileState,
  ProficiencyLevelState,
} from "../types";
import { BackupData } from "@/utils/backupHelper";

interface AssessmentContextType {
  matrix: ModuleState[];
  profiles: ProfileState[];
  stacks: string[];
  levelMappings: ProficiencyLevelState[];
  assessments: AssessmentSessionState[];
  evaluations: AssessorFeedbackState[];
  assessorName: string;
  setAssessorName: (name: string) => void;
  handleDataLoad: (
    matrix: ModuleState[],
    profiles: ProfileState[],
    stacks: string[],
    levelMappings?: ProficiencyLevelState[],
  ) => void;
  createAssessment: (assessment: AssessmentSessionState) => void;
  createEvaluation: (evaluation: AssessorFeedbackState) => void;
  updateAssessment: (id: string, data: Partial<AssessmentSessionState>) => void;
  updateEvaluation: (id: string, data: Partial<AssessorFeedbackState>) => void;
  backupApplicationState: () => void;
  restoreApplicationState: (data: BackupData) => void;

  hostedSessionId: string | null;
  setHostedSessionId: (id: string | null) => void;
  guestHostId: string | null;
  setGuestHostId: (id: string | null) => void;
  guestAssessmentId: string | null;
  setGuestAssessmentId: (id: string | null) => void;

  hostSession: PeerSessionState;
  guestSession: PeerSessionState;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined,
);

export const AssessmentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    matrix,
    profiles,
    stacks,
    levelMappings,
    assessments,
    evaluations,
    assessorName,
    setAssessorName,
    handleDataLoad,
    createAssessment,
    createEvaluation,
    updateAssessment,
    updateEvaluation,
    backupApplicationState,
    restoreApplicationState,
  } = useApplicationData();

  const [hostedSessionId, setHostedSessionId] = useState<string | null>(null);
  const [guestHostId, setGuestHostId] = useState<string | null>(null);
  const [guestAssessmentId, setGuestAssessmentId] = useState<string | null>(
    null,
  );

  // Host Session Hook
  const hostSession = usePeerSession({
    assessorName,
    currentAssessment: assessments.find((a) => a.id === hostedSessionId),
    currentEvaluations: evaluations.filter(
      (e) => e.assessmentId === hostedSessionId,
    ),
    currentMatrix: matrix,
    currentProfiles: profiles,
    currentStacks: stacks,
    onSyncReceived: (
      _a: AssessmentSessionState,
      evaluations: AssessorFeedbackState[],
    ) => {
      evaluations.forEach((ev) => createEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorFeedbackState) => createEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (hostedSessionId) updateAssessment(hostedSessionId, update);
    },
    onSessionClosed: () => {
      setHostedSessionId(null);
    },
  });

  // Guest Session Hook
  const guestSession = usePeerSession({
    assessorName,
    onSyncReceived: (
      syncedAssessment: AssessmentSessionState,
      syncedEvaluations: AssessorFeedbackState[],
      syncedMatrix: ModuleState[],
      syncedProfiles: ProfileState[],
      syncedStacks: string[],
    ) => {
      if (syncedAssessment) {
        createAssessment(syncedAssessment);
        setGuestAssessmentId(syncedAssessment.id);
      }
      if (syncedMatrix && syncedProfiles && syncedStacks) {
        handleDataLoad(syncedMatrix, syncedProfiles, syncedStacks);
      }
      syncedEvaluations.forEach((ev) => createEvaluation(ev));
    },
    onEvaluationReceived: (ev: AssessorFeedbackState) => createEvaluation(ev),
    onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => {
      if (update.id) {
        updateAssessment(update.id, update);
      }
    },
    onSessionClosed: () => {
      setGuestHostId(null);
      setGuestAssessmentId(null);
    },
  });

  return (
    <AssessmentContext.Provider
      value={{
        matrix,
        profiles,
        stacks,
        levelMappings,
        assessments,
        evaluations,
        assessorName,
        setAssessorName,
        handleDataLoad,
        createAssessment,
        createEvaluation,
        updateAssessment,
        updateEvaluation,
        backupApplicationState,
        restoreApplicationState,

        hostedSessionId,
        setHostedSessionId,
        guestHostId,
        setGuestHostId,
        guestAssessmentId,
        setGuestAssessmentId,

        hostSession,
        guestSession,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
