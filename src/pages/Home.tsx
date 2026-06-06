import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseAssessmentData, validateCsvContent } from "../utils/csvHelpers";
import { parseBackup, type BackupData } from "../utils/backupHelper";
import type {
  ModuleState,
  ProfileState,
  FileStatus,
  AssessorEvaluationState,
  AssessmentSessionState,
  LevelMapping,
} from "../types";
import { ImportForm } from "../components/home/ImportForm";
import { SessionForm } from "../components/home/SessionForm";
import { AssessmentSessionCard } from "../components/dashboard/AssessmentSessionCard";
import { ActionCard } from "../components/dashboard/ActionCard";
import { Modal } from "../components/ui/Modal";
import {
  Box,
  Library,
  Plus,
  UploadCloud,
  Search,
  X,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { FilterChip } from "../components/ui/FilterChip";

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
  // This avoids the "setState inside useEffect" pattern (cascading render)
  const isImportModalOpen = !hasData || manualImportOpen;

  // File States
  const [profFile, setProfFile] = useState<File | null>(null);
  const [profUrl, setProfUrl] = useState("");
  const [profStatus, setProfStatus] = useState<FileStatus>("idle");
  const [profProgress, setProfProgress] = useState(0);
  const [profError, setProfError] = useState<string | null>(null);

  const [topFile, setTopFile] = useState<File | null>(null);
  const [topUrl, setTopUrl] = useState("");
  const [topStatus, setTopStatus] = useState<FileStatus>("idle");
  const [topProgress, setTopProgress] = useState(0);
  const [topError, setTopError] = useState<string | null>(null);

  const [modFile, setModFile] = useState<File | null>(null);
  const [modUrl, setModUrl] = useState("");
  const [modStatus, setModStatus] = useState<FileStatus>("idle");
  const [modProgress, setModProgress] = useState(0);
  const [modError, setModError] = useState<string | null>(null);

  const [levelFile, setLevelFile] = useState<File | null>(null);
  const [levelUrl, setLevelUrl] = useState("");
  const [levelStatus, setLevelStatus] = useState<FileStatus>("idle");
  const [levelProgress, setLevelProgress] = useState(0);
  const [levelError, setLevelError] = useState<string | null>(null);

  // Parsed Output
  const [parsedContext, setParsedContext] = useState<{
    matrix: ModuleState[];
    profiles: ProfileState[];
    stacks: string[];
    levelMappings?: LevelMapping[];
  } | null>(null);

  const currentStacks = parsedContext ? parsedContext.stacks : existingStacks;
  const currentProfiles = parsedContext
    ? parsedContext.profiles
    : existingProfiles;

  const currentLevelMappings =
    parsedContext?.levelMappings ?? existingLevelMappings;

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  // Sort States
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedProfiles([]);
    setSelectedStacks([]);
    setSortBy("date");
    setSortOrder("desc");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedProfiles.length > 0 ||
    selectedStacks.length > 0 ||
    sortBy !== "date" ||
    sortOrder !== "desc";

  // Toggle helpers
  const toggleProfile = (profileId: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  // Get dynamic counts for pills
  const getProfileCount = (profileId: string) => {
    return assessments
      .filter((a) => a.id !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.candidateName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesStack =
          selectedStacks.length === 0 || selectedStacks.includes(a.stack);
        return matchesName && matchesStack && a.profileId === profileId;
      }).length;
  };

  const getStackCount = (stack: string) => {
    return assessments
      .filter((a) => a.id !== hostedSessionId)
      .filter((a) => {
        const matchesName = a.candidateName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesProfile =
          selectedProfiles.length === 0 ||
          selectedProfiles.includes(a.profileId);
        return matchesName && matchesProfile && a.stack === stack;
      }).length;
  };

  // Build a list of all chips (profiles and stacks combined) and sort them by overall count (popularity)
  const unifiedChips = [
    ...currentProfiles.map((p) => {
      const totalCount = assessments.filter(
        (a) => a.id !== hostedSessionId && a.profileId === p.id,
      ).length;
      return {
        type: "profile" as const,
        id: p.id,
        label: p.title,
        popularity: totalCount,
      };
    }),
    ...currentStacks.map((s) => {
      const totalCount = assessments.filter(
        (a) => a.id !== hostedSessionId && a.stack === s,
      ).length;
      return {
        type: "stack" as const,
        id: s,
        label: s,
        popularity: totalCount,
      };
    }),
  ].sort(
    (a, b) => b.popularity - a.popularity || a.label.localeCompare(b.label),
  );

  // Filter assessments based on search criteria
  const filteredAssessments = assessments
    .filter((a) => a.id !== hostedSessionId)
    .filter((assessment) => {
      const matchesName = assessment.candidateName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesProfile =
        selectedProfiles.length === 0 ||
        selectedProfiles.includes(assessment.profileId);
      const matchesStack =
        selectedStacks.length === 0 ||
        selectedStacks.includes(assessment.stack);
      return matchesName && matchesProfile && matchesStack;
    });

  // Sort assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.candidateName.localeCompare(b.candidateName);
    } else if (sortBy === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const displayAssessments = hasActiveFilters
    ? sortedAssessments
    : sortedAssessments.slice(0, 10);

  // Form State
  const [name, setNameInput] = useState("");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [selectedProfileId, setLocalProfileId] = useState("");

  const handleOpenSessionModal = () => {
    if (!selectedStackKey && currentStacks.length > 0) {
      setSelectedStackKey(currentStacks[0]);
    }
    if (!selectedProfileId && currentProfiles.length > 0) {
      setLocalProfileId(currentProfiles[0].id);
    }
    setIsSessionModalOpen(true);
  };

  const processFile = async (
    file: File | null,
    url: string,
    type: "profiles" | "topics" | "modules" | "levels",
    setStatus: (s: FileStatus) => void,
    setProgress: (p: number) => void,
    setError: (e: string | null) => void,
  ) => {
    if (!file && !url) return;
    setStatus("uploading");
    setError(null);

    let content = "";
    if (file) {
      try {
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } catch (e) {
        console.error(e);
        setStatus("error");
        setError("Failed to read file");
        return;
      }
    } else {
      setStatus("error");
      setError("URL import not implemented yet");
      return;
    }

    const errorMsg = validateCsvContent(content, type);
    if (errorMsg) {
      setStatus("idle");
      setError(errorMsg);
      return;
    }

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p > 100) {
        p = 100;
        clearInterval(interval);
        setStatus("parsing");
        setTimeout(() => setStatus("done"), 500);
      }
      setProgress(p);
    }, 200);
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
    } catch (error) {
      console.error(error);
      alert("Failed to restore backup: " + (error as Error).message);
    }
  };

  // Event Handlers for File/URL changes
  // We handle this via events instead of useEffect to avoid cascading renders
  const handleProfFileChange = (file: File | null) => {
    setProfFile(file);
    if (!file && !profUrl) {
      setProfStatus("idle");
      setProfError(null);
    } else {
      processFile(
        file,
        profUrl,
        "profiles",
        setProfStatus,
        setProfProgress,
        setProfError,
      );
    }
  };

  const handleProfUrlChange = (url: string) => {
    setProfUrl(url);
    if (!profFile && !url) {
      setProfStatus("idle");
      setProfError(null);
    } else {
      processFile(
        profFile,
        url,
        "profiles",
        setProfStatus,
        setProfProgress,
        setProfError,
      );
    }
  };

  const handleTopFileChange = (file: File | null) => {
    setTopFile(file);
    if (!file && !topUrl) {
      setTopStatus("idle");
      setTopError(null);
    } else {
      processFile(
        file,
        topUrl,
        "topics",
        setTopStatus,
        setTopProgress,
        setTopError,
      );
    }
  };

  const handleTopUrlChange = (url: string) => {
    setTopUrl(url);
    if (!topFile && !url) {
      setTopStatus("idle");
      setTopError(null);
    } else {
      processFile(
        topFile,
        url,
        "topics",
        setTopStatus,
        setTopProgress,
        setTopError,
      );
    }
  };

  const handleModFileChange = (file: File | null) => {
    setModFile(file);
    if (!file && !modUrl) {
      setModStatus("idle");
      setModError(null);
    } else {
      processFile(
        file,
        modUrl,
        "modules",
        setModStatus,
        setModProgress,
        setModError,
      );
    }
  };

  const handleModUrlChange = (url: string) => {
    setModUrl(url);
    if (!modFile && !url) {
      setModStatus("idle");
      setModError(null);
    } else {
      processFile(
        modFile,
        url,
        "modules",
        setModStatus,
        setModProgress,
        setModError,
      );
    }
  };

  const handleLevelFileChange = (file: File | null) => {
    setLevelFile(file);
    if (!file && !levelUrl) {
      setLevelStatus("idle");
      setLevelError(null);
    } else {
      processFile(
        file,
        levelUrl,
        "levels",
        setLevelStatus,
        setLevelProgress,
        setLevelError,
      );
    }
  };

  const handleLevelUrlChange = (url: string) => {
    setLevelUrl(url);
    if (!levelFile && !url) {
      setLevelStatus("idle");
      setLevelError(null);
    } else {
      processFile(
        levelFile,
        url,
        "levels",
        setLevelStatus,
        setLevelProgress,
        setLevelError,
      );
    }
  };

  // Determine what data we have
  const hasProfiles = existingProfiles.length > 0;
  const hasTopics = existingMatrix.length > 0;
  // Check if at least one module has a description, implying modules file was loaded
  const hasModules = existingMatrix.some((m) => !!m.description);
  const hasLevelMappings = existingLevelMappings.length > 0;

  useEffect(() => {
    // If we have data for a specific type, input is optional (idle is fine).
    // If we don't have data, input is required (must be done).
    // Note: Modules and Level Mappings are technically optional in the parser but if we want to enforce structure:
    // Profiles and Topics are usually required for a valid assessment.

    const profValid = hasProfiles
      ? profStatus === "idle" || profStatus === "done"
      : profStatus === "done";
    const topValid = hasTopics
      ? topStatus === "idle" || topStatus === "done"
      : topStatus === "done";

    // Modules/Levels always optional effectively, but let's stick to pattern
    const modValid = modStatus === "idle" || modStatus === "done";
    const levelValid = levelStatus === "idle" || levelStatus === "done";

    if (profValid && topValid && modValid && levelValid) {
      const readAll = async () => {
        const filesToRead: {
          name: string;
          content: string;
          type: "profiles" | "topics" | "modules" | "levels";
        }[] = [];

        const readFile = (f: File) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsText(f);
          });

        if (profFile)
          filesToRead.push({
            name: profFile.name,
            content: await readFile(profFile),
            type: "profiles",
          });
        if (topFile)
          filesToRead.push({
            name: topFile.name,
            content: await readFile(topFile),
            type: "topics",
          });
        if (modFile)
          filesToRead.push({
            name: modFile.name,
            content: await readFile(modFile),
            type: "modules",
          });
        if (levelFile)
          filesToRead.push({
            name: levelFile.name,
            content: await readFile(levelFile),
            type: "levels",
          });

        if (filesToRead.length === 0 && hasData) {
          // If no files to read and we have data, we explicitly set parsedContext to null
          // so handleImportComplete does not trigger onDataLoad (unless we want to support "reset"?)
          // actually, logic is: if parsedContext is null, we don't update data.
          // So doing nothing is fine.

          // But wait! If I uploaded a file then removed it (back to idle), filesToRead is empty.
          // parsedContext should be cleared or reset?
          setParsedContext(null);
          return;
        }

        try {
          const data = parseAssessmentData(filesToRead);

          if (hasData) {
            if (data.matrix.length === 0) data.matrix = existingMatrix;
            if (data.profiles.length === 0) data.profiles = existingProfiles;
            // Stacks is a Record. Check if keys exist.
            if (Object.keys(data.stacks).length === 0)
              data.stacks = existingStacks;
            if (!data.levelMappings || data.levelMappings.length === 0)
              data.levelMappings = existingLevelMappings;
          }

          setParsedContext(data);
        } catch (e) {
          console.error("Failed to parse", e);
        }
      };
      readAll();
    }
  }, [
    profStatus,
    topStatus,
    modStatus,
    levelStatus,
    profFile,
    topFile,
    modFile,
    levelFile,
    hasData,
    existingMatrix,
    existingProfiles,
    existingStacks,
    existingLevelMappings,
    hasProfiles,
    hasTopics,
  ]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedStackKey || !selectedProfileId) return;

    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
        parsedContext.levelMappings,
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
    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
        parsedContext.levelMappings,
      );
    }
    setManualImportOpen(false);
  };

  const canImport =
    (hasProfiles
      ? profStatus === "idle" || profStatus === "done"
      : profStatus === "done") &&
    (hasTopics
      ? topStatus === "idle" || topStatus === "done"
      : topStatus === "done") &&
    (modStatus === "idle" || modStatus === "done") &&
    (levelStatus === "idle" || levelStatus === "done");
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
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <UploadCloud size={18} className="rotate-180" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm cursor-pointer">
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
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <UploadCloud size={18} />
              <span>Configuration</span>
            </button>

            <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>

            <button
              onClick={() => navigate("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <Library size={18} />
              <span>View Library</span>
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-lg max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
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
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                Import Data Now
              </button>
            </div>
          ) : (
            <>
              {/* Active / Ongoing Session */}
              {(hostedSessionId || guestAssessmentId) && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Ongoing Assessment
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {assessments
                      .filter(
                        (a) =>
                          a.id === hostedSessionId ||
                          a.id === guestAssessmentId,
                      )
                      .map((assessment) => {
                        const isHosted = assessment.id === hostedSessionId;
                        const displaySession: AssessorEvaluationState = {
                          id: assessment.id,
                          assessmentId: assessment.id,
                          candidateName: assessment.candidateName,
                          profileTitle: assessment.profileTitle,
                          profileId: assessment.profileId,
                          stack: assessment.stack,
                          date: assessment.date,
                          status: "ongoing", // Force ongoing for active session
                          scores: {},
                          notes: {},
                          finalScore: undefined,
                          assessorName: isHosted
                            ? "Your Session"
                            : "Participating",
                          hostId:
                            !isHosted && guestAssessmentId
                              ? guestHostId || undefined
                              : undefined,
                        };

                        return (
                          <AssessmentSessionCard
                            key={assessment.id}
                            session={displaySession}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

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
              <div className="flex flex-col gap-4 mb-8">
                {/* Search & Sort controls row */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  {/* Name Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search candidate by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer mr-1"
                      >
                        <X size={16} />
                        Clear Filters
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 font-medium select-none">
                        Sort by
                      </span>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(e.target.value as "date" | "name")
                          }
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1rem",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <option value="date">Date Added</option>
                          <option value="name">Candidate Name</option>
                        </select>
                      </div>

                      <button
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        title={
                          sortOrder === "asc"
                            ? "Sort Ascending"
                            : "Sort Descending"
                        }
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center shadow-sm"
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUpNarrowWide className="w-5 h-5" />
                        ) : (
                          <ArrowDownNarrowWide className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unified scrollable Tag Chips (Profiles & Tech Stacks) */}
                <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {unifiedChips.map((chip) => {
                    const isProfile = chip.type === "profile";
                    const isSelected = isProfile
                      ? selectedProfiles.includes(chip.id)
                      : selectedStacks.includes(chip.id);

                    const count = isProfile
                      ? getProfileCount(chip.id)
                      : getStackCount(chip.id);

                    return (
                      <FilterChip
                        key={`${chip.type}-${chip.id}`}
                        label={chip.label}
                        isSelected={isSelected}
                        onClick={() =>
                          isProfile
                            ? toggleProfile(chip.id)
                            : toggleStack(chip.id)
                        }
                        count={count}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ActionCard
                  icon={<Plus size={24} />}
                  title="New Assessment"
                  description="Start a new evaluation session for a candidate"
                  onClick={handleOpenSessionModal}
                />
                {displayAssessments.map((assessment) => {
                  // Find evaluations for this assessment to compute status/score
                  const relatedEvals = evaluations.filter(
                    (e) => e.assessmentId === assessment.id,
                  );
                  const completed = relatedEvals.filter(
                    (e) => e.status === "completed",
                  );
                  const isCompleted =
                    relatedEvals.length > 0 &&
                    relatedEvals.every((e) => e.status === "completed");
                  // Compute average score
                  const totalScore = completed.reduce(
                    (acc, curr) => acc + (curr.finalScore || 0),
                    0,
                  );
                  const avgScore =
                    completed.length > 0
                      ? totalScore / completed.length
                      : undefined;

                  // Construct a display object compatible with AssessmentSessionCard
                  // We treat 'locked' as a pseudo-status or just use ongoing/completed
                  const displaySession: AssessorEvaluationState = {
                    id: assessment.id, // Use Group ID as ID for navigation
                    assessmentId: assessment.id, // It IS the assessment
                    candidateName: assessment.candidateName,
                    profileTitle: assessment.profileTitle,
                    profileId: assessment.profileId,
                    stack: assessment.stack,
                    date: assessment.date,
                    status: assessment.locked
                      ? "completed"
                      : isCompleted
                        ? "completed"
                        : "ongoing",
                    scores: {},
                    notes: {},
                    finalScore: avgScore,
                    assessorName: "Group", // Placeholder
                  };

                  return (
                    <AssessmentSessionCard
                      key={assessment.id}
                      session={displaySession}
                      levelMappings={currentLevelMappings}
                    />
                  );
                })}
                {hasActiveFilters && displayAssessments.length === 0 && (
                  <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                    <Search className="text-slate-300 w-12 h-12 mb-3" />
                    <p className="text-slate-500 font-medium">
                      No assessments match your filters
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
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
          profFile={profFile}
          setProfFile={handleProfFileChange}
          profUrl={profUrl}
          setProfUrl={handleProfUrlChange}
          profStatus={profStatus}
          profProgress={profProgress}
          profError={profError}
          topFile={topFile}
          setTopFile={handleTopFileChange}
          topUrl={topUrl}
          setTopUrl={handleTopUrlChange}
          topStatus={topStatus}
          topProgress={topProgress}
          topError={topError}
          modFile={modFile}
          setModFile={handleModFileChange}
          modUrl={modUrl}
          setModUrl={handleModUrlChange}
          modStatus={modStatus}
          modProgress={modProgress}
          modError={modError}
          levelsFile={levelFile}
          setLevelsFile={handleLevelFileChange}
          levelsUrl={levelUrl}
          setLevelsUrl={handleLevelUrlChange}
          levelsStatus={levelStatus}
          levelsProgress={levelProgress}
          levelsError={levelError}
          assessorName={assessorName}
          setAssessorName={setAssessorName}
        />
        <div className="mt-6 flex justify-end">
          <button
            disabled={!canImport || !assessorName.trim()}
            onClick={handleImportComplete}
            className="px-6 py-2 bg-indigo-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
          >
            Save & Update Library
          </button>
        </div>
      </Modal>
    </div>
  );
};
