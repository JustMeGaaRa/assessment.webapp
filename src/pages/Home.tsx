import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseAssessmentData, validateCsvContent } from "../utils/csvHelpers";
import type { Module, Profile, FileStatus, AssessmentSession } from "../types";
import { ImportStep } from "../components/home/ImportStep";
import { SessionForm } from "../components/home/SessionForm";
import { AssessmentSessionCard } from "../components/dashboard/AssessmentSessionCard";
import { NewAssessmentCard } from "../components/dashboard/NewAssessmentCard";
import { Modal } from "../components/ui/Modal";
import { FileText, Library, UploadCloud } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";

interface HomeProps {
  sessions: AssessmentSession[];
  onCreateSession: (session: AssessmentSession) => void;
  onDataLoad: (
    matrix: Module[],
    profiles: Profile[],
    stacks: Record<string, string>,
  ) => void;
  existingStacks: string[];
  existingProfiles: Profile[];
  hasData: boolean;
}

export const Home = ({
  sessions,
  onCreateSession,
  onDataLoad,
  existingStacks,
  existingProfiles,
  hasData,
}: HomeProps) => {
  const navigate = useNavigate();

  // Modal States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Automatically prompt for import if no data exists on load
  useEffect(() => {
    if (!hasData) {
      setIsImportModalOpen(true);
    }
  }, [hasData]);

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

  // Parsed Output
  const [parsedContext, setParsedContext] = useState<{
    matrix: Module[];
    profiles: Profile[];
    stacks: Record<string, string>;
  } | null>(null);

  const currentStacks = parsedContext
    ? Object.values(parsedContext.stacks)
    : existingStacks;
  const currentProfiles = parsedContext
    ? parsedContext.profiles
    : existingProfiles;

  // Form State
  const [name, setNameInput] = useState("");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [selectedProfileId, setLocalProfileId] = useState("");

  // Auto-select defaults when session modal opens
  useEffect(() => {
    if (isSessionModalOpen) {
      if (!selectedStackKey && currentStacks.length > 0) {
        setSelectedStackKey(currentStacks[0]);
      }
      if (!selectedProfileId && currentProfiles.length > 0) {
        setLocalProfileId(currentProfiles[0].id);
      }
    }
  }, [
    isSessionModalOpen,
    currentStacks,
    currentProfiles,
    selectedStackKey,
    selectedProfileId,
  ]);

  const processFile = async (
    file: File | null,
    url: string,
    type: "profiles" | "topics" | "modules",
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

  useEffect(() => {
    if (!profFile && !profUrl) {
      setProfStatus("idle");
      setProfError(null);
      return;
    }
    if ((profFile || profUrl) && profStatus === "idle" && !profError) {
      processFile(
        profFile,
        profUrl,
        "profiles",
        setProfStatus,
        setProfProgress,
        setProfError,
      );
    }
  }, [profFile, profUrl, profStatus, profError]);

  useEffect(() => {
    if (!topFile && !topUrl) {
      setTopStatus("idle");
      setTopError(null);
      return;
    }
    if ((topFile || topUrl) && topStatus === "idle" && !topError) {
      processFile(
        topFile,
        topUrl,
        "topics",
        setTopStatus,
        setTopProgress,
        setTopError,
      );
    }
  }, [topFile, topUrl, topStatus, topError]);

  useEffect(() => {
    if (!modFile && !modUrl) {
      setModStatus("idle");
      setModError(null);
      return;
    }
    if ((modFile || modUrl) && modStatus === "idle" && !modError) {
      processFile(
        modFile,
        modUrl,
        "modules",
        setModStatus,
        setModProgress,
        setModError,
      );
    }
  }, [modFile, modUrl, modStatus, modError]);

  useEffect(() => {
    if (profStatus === "done" && topStatus === "done") {
      const readAll = async () => {
        const filesToRead: {
          name: string;
          content: string;
          type: "profiles" | "topics" | "modules";
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

        try {
          const data = parseAssessmentData(filesToRead);
          setParsedContext(data);
        } catch (e) {
          console.error("Failed to parse", e);
        }
      };
      readAll();
    }
  }, [profStatus, topStatus, modStatus, profFile, topFile, modFile]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedStackKey || !selectedProfileId) return;

    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
      );
    }

    const sessionId = crypto.randomUUID();
    const profile = currentProfiles.find((p) => p.id === selectedProfileId);

    const newSession: AssessmentSession = {
      id: sessionId,
      candidateName: name,
      profileId: selectedProfileId,
      profileTitle: profile?.title || "Unknown Profile",
      stack: selectedStackKey,
      date: new Date().toISOString(),
      status: "ongoing",
      scores: {},
      notes: {},
    };

    onCreateSession(newSession);
    navigate(`/assessment/${sessionId}`);
  };

  const handleImportComplete = () => {
    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
      );
    }
    setIsImportModalOpen(false);
  };

  const canImport = profStatus === "done" && topStatus === "done";
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
              onClick={() => navigate("/library")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <Library size={18} />
              <span>View Library</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
            >
              <UploadCloud size={18} />
              <span>Import Data</span>
            </button>
          </div>
        </div>

        <PageHeader
          icon={<FileText className="text-indigo-600 w-8 h-8" />}
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
                onClick={() => setIsImportModalOpen(true)}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                Import Data Now
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Recent Assessments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <NewAssessmentCard
                  onClick={() => setIsSessionModalOpen(true)}
                />
                {sessions.slice(0, 10).map((session) => (
                  <AssessmentSessionCard key={session.id} session={session} />
                ))}
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
        onClose={() => hasData && setIsImportModalOpen(false)}
        title="Import Assessment Data"
      >
        <ImportStep
          profFile={profFile}
          setProfFile={setProfFile}
          profUrl={profUrl}
          setProfUrl={setProfUrl}
          profStatus={profStatus}
          profProgress={profProgress}
          profError={profError}
          topFile={topFile}
          setTopFile={setTopFile}
          topUrl={topUrl}
          setTopUrl={setTopUrl}
          topStatus={topStatus}
          topProgress={topProgress}
          topError={topError}
          modFile={modFile}
          setModFile={setModFile}
          modUrl={modUrl}
          setModUrl={setModUrl}
          modStatus={modStatus}
          modProgress={modProgress}
          modError={modError}
        />
        <div className="mt-6 flex justify-end">
          <button
            disabled={!canImport}
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
