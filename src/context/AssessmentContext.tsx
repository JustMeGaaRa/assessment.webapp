"use client";

import React, { createContext, useContext, useState } from "react";
import { useApplicationData } from "../hooks/useApplicationData";
import { usePeerSession, type PeerSessionState } from "../hooks/usePeerSession";
import {
  AssessmentSession,
  CompetenceMatrix,
  ProficiencyLevel,
  Profile,
  IndividualAssessmentScore,
  AssessmentDetails,
} from "../lib/matrix/types";
import { BackupData } from "@/utils/backupHelper";

interface AssessmentContextType {
  matrix: CompetenceMatrix;
  profiles: Profile[];
  stacks: string[];
  levelMappings: ProficiencyLevel[];
  assessments: AssessmentSession[];
  assessorName: string;
  setAssessorName: (name: string) => void;
  handleDataLoad: (
    matrix: CompetenceMatrix,
    profiles: Profile[],
    levelMappings: ProficiencyLevel[],
  ) => void;
  createAssessment: (assessment: AssessmentSession) => void;
  createEvaluation: (assessmentId: string, evaluation: IndividualAssessmentScore) => void;
  updateAssessment: (id: string, data: Partial<AssessmentSession>) => void;
  updateEvaluation: (id: string, data: Partial<IndividualAssessmentScore>) => void;
  deleteEvaluation: (assessmentId: string, evaluationId: string) => void;
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
    proficiencyLevels,
    assessments,
    assessorName,
    setAssessorName,
    handleDataLoad,
    createAssessment,
    createEvaluation,
    updateAssessment,
    updateEvaluation,
    deleteEvaluation,
    backupApplicationState,
    restoreApplicationState,
  } = useApplicationData();

  const stacks = matrix.stacks.map((s) => s.stackName);

  const [hostedSessionId, setHostedSessionId] = useState<string | null>(null);
  const [guestHostId, setGuestHostId] = useState<string | null>(null);
  const [guestAssessmentId, setGuestAssessmentId] = useState<string | null>(
    null,
  );

  // Host Session Hook
  const hostSession = usePeerSession({
    assessorName,
    currentAssessment: assessments.find((a) => a.assessmentId === hostedSessionId),
    currentMatrix: matrix,
    currentProfiles: profiles,
    currentProficiencyLevels: proficiencyLevels,
    onSyncReceived: () => {},
    onEvaluationReceived: (assessmentId: string, ev: IndividualAssessmentScore) => {
      createEvaluation(assessmentId, ev);
    },
    onEvaluationDeleted: (assessmentId: string, evaluationId: string) => {
      deleteEvaluation(assessmentId, evaluationId);
    },
    onAssessmentUpdateReceived: (assessmentId: string, update: Partial<AssessmentDetails>) => {
      updateAssessment(assessmentId, { details: update as AssessmentDetails });
    },
    onSessionClosed: () => {
      setHostedSessionId(null);
    },
  });

  // Guest Session Hook
  const guestSession = usePeerSession({
    assessorName,
    onSyncReceived: (
      syncedAssessment: AssessmentSession,
      syncedMatrix: CompetenceMatrix,
      syncedProfiles: Profile[],
      syncedProficiencyLevels: ProficiencyLevel[],
    ) => {
      if (syncedAssessment) {
        createAssessment(syncedAssessment);
        setGuestAssessmentId(syncedAssessment.assessmentId);
      }
      if (syncedMatrix && syncedProfiles && syncedProficiencyLevels) {
        handleDataLoad(syncedMatrix, syncedProfiles, syncedProficiencyLevels);
      }
    },
    onEvaluationReceived: (assessmentId: string, ev: IndividualAssessmentScore) => {
      createEvaluation(assessmentId, ev);
    },
    onEvaluationDeleted: (assessmentId: string, evaluationId: string) => {
      deleteEvaluation(assessmentId, evaluationId);
    },
    onAssessmentUpdateReceived: (assessmentId: string, update: Partial<AssessmentDetails>) => {
      updateAssessment(assessmentId, { details: update as AssessmentDetails });
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
        levelMappings: proficiencyLevels,
        assessments,
        assessorName,
        setAssessorName,
        handleDataLoad,
        createAssessment,
        createEvaluation,
        updateAssessment,
        updateEvaluation,
        deleteEvaluation,
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
