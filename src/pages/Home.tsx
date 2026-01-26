import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseAssessmentData, validateCsvContent } from "../utils/csvHelpers";
import type { Module, Profile, FileStatus } from "../types";
import { HomeHeader } from "../components/home/HomeHeader";
import { ImportStep } from "../components/home/ImportStep";
import { SessionForm } from "../components/home/SessionForm";

interface HomeProps {
  setCandidateName: (name: string) => void;
  setSelectedStack: (stack: string) => void;
  setSelectedProfileId: (id: string) => void;
  onStart: () => void;
  onDataLoad: (
    matrix: Module[],
    profiles: Profile[],
    stacks: Record<string, string>,
  ) => void;
  existingStacks: string[];
  existingProfiles: Profile[];
}

export const Home = ({
  setCandidateName,
  setSelectedStack,
  setSelectedProfileId,
  onStart,
  onDataLoad,
  existingStacks,
  existingProfiles,
  hasData,
}: HomeProps & { hasData?: boolean }) => {
  const navigate = useNavigate();
  // If data exists, start at step 2. Otherwise step 1.
  const [step, setStep] = useState(hasData ? 2 : 1);

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

  // Auto-select defaults when entering step 2
  useEffect(() => {
    if (step === 2) {
      if (!selectedStackKey && currentStacks.length > 0) {
        setSelectedStackKey(currentStacks[0]);
      }
      if (!selectedProfileId && currentProfiles.length > 0) {
        setLocalProfileId(currentProfiles[0].id);
      }
    }
  }, [
    step,
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

    // Reading File if present
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
      // Assume URL fetch mock or implementation
      // For now, fail URL
      setStatus("error");
      setError("URL import not implemented yet");
      return;
    }

    // Validate
    const errorMsg = validateCsvContent(content, type);
    if (errorMsg) {
      setStatus("idle"); // Reset to idle to allow re-upload? Or error state.
      // Actually, if we set 'error' state, we might want to stay in idle/error UI.
      // My DataSourceInput UI handles 'error' prop.
      // If I set status to 'idle', it shows the upload box. If error is set, it shows error style. Perfect.
      setStatus("idle");
      setError(errorMsg);
      return;
    }

    // Simulate Parsing Progress if valid
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

  // Watch for file changes
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

  // Parse when all required ready
  useEffect(() => {
    if (profStatus === "done" && topStatus === "done") {
      // Ideally we read the actual file content here.
      // For this demo, since we don't have FileReader async logic in the simulation above,
      // we will do it "just in time" or assume we read it.
      // Let's actually read them now.

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
  }, [profStatus, topStatus, modStatus, profFile, topFile, modFile]); // Re-run if status changes to done

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedStackKey || !selectedProfileId) return;

    // Use default/existing if parsing wasn't done or failed, otherwise use parsed
    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
      );
    }

    setCandidateName(name);
    setSelectedStack(selectedStackKey);
    setSelectedProfileId(selectedProfileId);
    // We would pass stack/profile selection to App if App needed it for logic,
    // but typically Assessment page handles the active stack view.
    // However, if we want to "Pre-select" the profile, we might need to store that in App state or pass it.
    // For now, onStart just resets scores.
    onStart();

    const sessionId = crypto.randomUUID();
    navigate(`/assessment/${sessionId}`);
  };

  // Handle moving to next step
  const canGoNext = profStatus === "done" && topStatus === "done";

  // Is form valid?
  const isFormValid =
    name.trim().length > 0 &&
    selectedStackKey !== "" &&
    selectedProfileId !== "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HomeHeader />

        <div className="max-w-2xl mx-auto">
          {/* Steps Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`h-1 flex-1 rounded-full ${step === 1 ? "bg-indigo-600" : "bg-emerald-500"}`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-indigo-600" : "bg-slate-200"}`}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 md:p-10">
            {step === 1 ? (
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
                canGoNext={canGoNext}
                onNext={() => setStep(2)}
              />
            ) : (
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
                onBack={() => setStep(1)}
              />
            )}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate("/library")}
              className="text-slate-400 font-semibold hover:text-indigo-600 text-sm transition-colors"
            >
              View Matrix Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
