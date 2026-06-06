import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseBackup, type BackupData } from "../utils/backupHelper";
import type {
  ModuleState,
  ProfileState,
  AssessorEvaluationState,
  AssessmentSessionState,
  LevelMapping,
} from "../types";
import { ImportForm } from "../components/home/ImportForm";
import { SessionForm } from "../components/home/SessionForm";
import { Modal } from "../components/ui/Modal";
import { Box, Library, UploadCloud } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";

import { useAssessmentFilters } from "../hooks/useAssessmentFilters";
import { useConfigImport } from "../hooks/useConfigImport";
import { OngoingAssessmentsSection } from "../components/home/OngoingAssessmentsSection";
import { AssessmentFiltersToolbar } from "../components/home/AssessmentFiltersToolbar";
import { AssessmentGrid } from "../components/home/AssessmentGrid";

interface HomePageProps {
  assessments: AssessmentSessionState[];
  evaluations: AssessorEvaluationState[];
  onCreateAssessment: (assessment: AssessmentSessionState) => void;
  onCreateSession: (session: AssessorEvaluationState) => void;
  onDataLoad: (
    matrix: ModuleState[],
    profiles: ProfileState[],
    stacks: string[],
    levelMappings?: LevelMapping[],
  ) => void;
  existingStacks: string[];
  existingProfiles: ProfileState[];
  existingMatrix: ModuleState[];
  existingLevelMappings: LevelMapping[];
  hasData: boolean;
  assessorName: string;
  setAssessorName: (name: string) => void;
  onBackup: () => void;
  onRestore: (data: BackupData) => void;
  hostedSessionId?: string | null;
  guestAssessmentId?: string | null;
  guestHostId?: string | null;
}

export const HomePage = ({
  assessments,
  evaluations,
  onCreateAssessment,
  onDataLoad,
  existingStacks,
  existingProfiles,
  existingMatrix,
  existingLevelMappings,
  hasData,
  assessorName,
  setAssessorName,
  onBackup,
  onRestore,
  hostedSessionId,
  guestAssessmentId,
  guestHostId,
}: HomePageProps) => {
  const navigate = useNavigate();

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [manualImportOpen, setManualImportOpen] = useState(false);

  // Open modal if no data exists OR user manually opened it
  const isImportModalOpen = !hasData || manualImportOpen;

  // Form State
  const [name, setNameInput] = useState("");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [selectedProfileId, setLocalProfileId] = useState("");

  const hasProfiles = existingProfiles.length > 0;
  const hasTopics = existingMatrix.length > 0;
  const hasModules = existingMatrix.some((m) => !!m.description);
  const hasLevelMappings = existingLevelMappings.length > 0;

  // Hook for CSV Config Import logic
  const configImport = useConfigImport({
    hasProfiles,
    hasTopics,
    hasData,
    existingMatrix,
    existingProfiles,
    existingStacks,
    existingLevelMappings,
  });

  const currentStacks = configImport.parsedContext
    ? configImport.parsedContext.stacks
    : existingStacks;
  const currentProfiles = configImport.parsedContext
    ? configImport.parsedContext.profiles
    : existingProfiles;
  const currentLevelMappings =
    configImport.parsedContext?.levelMappings ?? existingLevelMappings;

  // Hook for Filtering & Sorting logic
  const filters = useAssessmentFilters({
    assessments,
    currentProfiles,
    currentStacks,
    hostedSessionId,
  });

  const handleOpenSessionModal = () => {
    if (!selectedStackKey && currentStacks.length > 0) {
      setSelectedStackKey(currentStacks[0]);
    }
    if (!selectedProfileId && currentProfiles.length > 0) {
      setLocalProfileId(currentProfiles[0].id);
    }
    setIsSessionModalOpen(true);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedStackKey || !selectedProfileId) return;

    if (configImport.parsedContext) {
      onDataLoad(
        configImport.parsedContext.matrix,
        configImport.parsedContext.profiles,
        configImport.parsedContext.stacks,
        configImport.parsedContext.levelMappings,
      );
    }

    const assessmentId = crypto.randomUUID();
    const profile = currentProfiles.find((p) => p.id === selectedProfileId);

    const newAssessment: AssessmentSessionState = {
      id: assessmentId,
      candidateName: name,
      profileId: selectedProfileId,
      profileTitle: profile?.title || "Unknown Profile",
      stack: selectedStackKey,
      date: new Date().toISOString(),
      locked: false,
    };

    onCreateAssessment(newAssessment);
    navigate(`/assessment/${assessmentId}`);
  };

  const handleImportComplete = () => {
    if (configImport.parsedContext) {
      onDataLoad(
        configImport.parsedContext.matrix,
        configImport.parsedContext.profiles,
        configImport.parsedContext.stacks,
        configImport.parsedContext.levelMappings,
      );
    }
    setManualImportOpen(false);
  };

  const handleRestoreFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        "Restoring will overwrite current data. Are you sure you want to proceed?",
      )
    ) {
      return;
    }

    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      const backupData = parseBackup(content);
      onRestore(backupData);
      configImport.resetImportState();
    } catch (error) {
      console.error(error);
      alert("Failed to restore backup: " + (error as Error).message);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    selectedStackKey !== "" &&
    selectedProfileId !== "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div></div>
          <div className="flex gap-3">
            <button
              onClick={onBackup}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm animate-in fade-in duration-200"
            >
              <UploadCloud size={18} className="rotate-180" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm cursor-pointer animate-in fade-in duration-200">
              <UploadCloud size={18} />
              <span className="hidden sm:inline">Restore</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFileChange}
              />
            </label>

            <button
              onClick={() => setManualImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm animate-in fade-in duration-200"
            >
              <UploadCloud size={18} />
              <span className="hidden sm:inline">Configuration</span>
            </button>

            <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>

            <button
              onClick={() => navigate("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm animate-in fade-in duration-200"
            >
              <Library size={18} />
              <span className="hidden sm:inline">View Library</span>
            </button>
          </div>
        </div>

        <PageHeader
          icon={<Box className="text-indigo-600 w-8 h-8" />}
          title="Technical Assessment Portal"
          description="Streamlined assessment process for engineering candidates."
        />

        <div className="max-w-7xl mx-auto">
          {!hasData ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg max-w-2xl mx-auto mt-12 animate-in slide-in-from-bottom-6 duration-300">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <UploadCloud size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3">
                Library is Empty
              </h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                You need to import your assessment matrix data (Profiles,
                Topics, Modules) to get started.
              </p>
              <button
                onClick={() => setManualImportOpen(true)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer font-sans"
              >
                Import Data Now
              </button>
            </div>
          ) : (
            <>
              {/* Active / Ongoing Session */}
              <OngoingAssessmentsSection
                assessments={assessments}
                hostedSessionId={hostedSessionId}
                guestAssessmentId={guestAssessmentId}
                guestHostId={guestHostId}
              />

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
                    <span>Recent Assessments</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    All candidate evaluation sessions
                  </p>
                </div>
              </div>

              {/* Filter and Controls Suite */}
              <AssessmentFiltersToolbar
                searchTerm={filters.searchTerm}
                setSearchTerm={filters.setSearchTerm}
                sortBy={filters.sortBy}
                setSortBy={filters.setSortBy}
                sortOrder={filters.sortOrder}
                setSortOrder={filters.setSortOrder}
                unifiedChips={filters.unifiedChips}
                selectedProfiles={filters.selectedProfiles}
                selectedStacks={filters.selectedStacks}
                toggleProfile={filters.toggleProfile}
                toggleStack={filters.toggleStack}
                getProfileCount={filters.getProfileCount}
                getStackCount={filters.getStackCount}
              />

              {/* Candidates Assessments Grid */}
              <AssessmentGrid
                displayAssessments={filters.displayAssessments}
                evaluations={evaluations}
                currentLevelMappings={currentLevelMappings}
                hasActiveFilters={filters.hasActiveFilters}
                handleClearFilters={filters.handleClearFilters}
                handleOpenSessionModal={handleOpenSessionModal}
              />
            </>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title="Start New Assessment"
      >
        <SessionForm
          name={name}
          setName={setNameInput}
          selectedStackKey={selectedStackKey}
          setSelectedStackKey={setSelectedStackKey}
          selectedProfileId={selectedProfileId}
          setSelectedProfileId={setLocalProfileId}
          currentStacks={currentStacks}
          currentProfiles={currentProfiles}
          handleStart={handleStart}
          isFormValid={isFormValid}
        />
      </Modal>

      {/* Import Data Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => hasData && setManualImportOpen(false)}
        title={
          hasData ? "Configuration & Data Import" : "Import Assessment Data"
        }
      >
        <ImportForm
          hasProfiles={hasProfiles}
          hasTopics={hasTopics}
          hasModules={hasModules}
          hasLevelMappings={hasLevelMappings}
          profFile={configImport.profFile}
          setProfFile={configImport.setProfFile}
          profUrl={configImport.profUrl}
          setProfUrl={configImport.setProfUrl}
          profStatus={configImport.profStatus}
          profProgress={configImport.profProgress}
          profError={configImport.profError}
          topFile={configImport.topFile}
          setTopFile={configImport.setTopFile}
          topUrl={configImport.topUrl}
          setTopUrl={configImport.setTopUrl}
          topStatus={configImport.topStatus}
          topProgress={configImport.topProgress}
          topError={configImport.topError}
          modFile={configImport.modFile}
          setModFile={configImport.setModFile}
          modUrl={configImport.modUrl}
          setModUrl={configImport.setModUrl}
          modStatus={configImport.modStatus}
          modProgress={configImport.modProgress}
          modError={configImport.modError}
          levelsFile={configImport.levelsFile}
          setLevelsFile={configImport.setLevelsFile}
          levelsUrl={configImport.levelsUrl}
          setLevelsUrl={configImport.setLevelsUrl}
          levelsStatus={configImport.levelsStatus}
          levelsProgress={configImport.levelsProgress}
          levelsError={configImport.levelsError}
          assessorName={assessorName}
          setAssessorName={setAssessorName}
        />
        <div className="mt-6 flex justify-end">
          <button
            disabled={!configImport.canImport || !assessorName.trim()}
            onClick={handleImportComplete}
            className="px-6 py-2 bg-indigo-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Save & Update Library
          </button>
        </div>
      </Modal>
    </div>
  );
};
