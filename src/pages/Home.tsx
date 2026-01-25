import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  ArrowRight,
  UploadCloud,
  Link as LinkIcon,
  FileSpreadsheet,
  Check,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { parseAssessmentData } from "../utils/csvHelpers";

interface HomeProps {
  setCandidateName: (name: string) => void;
  onStart: () => void;
  onDataLoad: (
    matrix: any[],
    profiles: any[],
    stacks: Record<string, string>,
  ) => void;
  existingStacks: string[];
  existingProfiles: any[];
}

type DataSourceMode = "file" | "url";
type FileStatus = "idle" | "uploading" | "parsing" | "done";

interface DataSourceInputProps {
  label: string;
  required?: boolean;
  file: File | null;
  setFile: (f: File | null) => void;
  url: string;
  setUrl: (u: string) => void;
  status: FileStatus;
  progress: number;
}

const DataSourceInput = ({
  label,
  required,
  file,
  setFile,
  url,
  setUrl,
  status,
  progress,
}: DataSourceInputProps) => {
  const [mode, setMode] = useState<DataSourceMode>("file");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      }
    },
    [setFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-slate-400" />
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {status === "idle" && (
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                mode === "file"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                mode === "url"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Link
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        {status !== "idle" ? (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-indigo-600" size={20} />
                <span className="text-sm font-bold text-slate-700">
                  {file?.name || "Remote CSV"}
                </span>
              </div>
              {status === "done" ? (
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  <Check size={14} /> Ready
                </div>
              ) : (
                <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                  <Loader2 size={14} className="animate-spin" /> {status}...
                </div>
              )}
            </div>
            {status !== "done" && (
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : mode === "file" ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center text-center group ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <UploadCloud size={20} />
            </div>
            <p className="text-xs font-semibold text-slate-600">
              <span className="text-indigo-600">Click</span> or drag csv
            </p>
          </div>
        ) : (
          <div className="relative">
            <LinkIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Home = ({
  setCandidateName,
  onStart,
  onDataLoad,
  existingStacks,
  existingProfiles,
}: HomeProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // File States
  const [profFile, setProfFile] = useState<File | null>(null);
  const [profUrl, setProfUrl] = useState("");
  const [profStatus, setProfStatus] = useState<FileStatus>("idle");
  const [profProgress, setProfProgress] = useState(0);

  const [topFile, setTopFile] = useState<File | null>(null);
  const [topUrl, setTopUrl] = useState("");
  const [topStatus, setTopStatus] = useState<FileStatus>("idle");
  const [topProgress, setTopProgress] = useState(0);

  const [modFile, setModFile] = useState<File | null>(null);
  const [modUrl, setModUrl] = useState("");
  const [modStatus, setModStatus] = useState<FileStatus>("idle");
  const [modProgress, setModProgress] = useState(0);

  // Parsed Output
  const [parsedContext, setParsedContext] = useState<{
    matrix: any[];
    profiles: any[];
    stacks: Record<string, string>;
  } | null>(null);

  // Form State
  const [name, setNameInput] = useState("");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Handler to simulate upload/parse
  const processFile = (
    file: File | null,
    url: string,
    setStatus: (s: FileStatus) => void,
    setProgress: (p: number) => void,
  ) => {
    if (!file && !url) return;
    setStatus("uploading");
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
    if ((profFile || profUrl) && profStatus === "idle") {
      processFile(profFile, profUrl, setProfStatus, setProfProgress);
    }
  }, [profFile, profUrl, profStatus]);

  useEffect(() => {
    if ((topFile || topUrl) && topStatus === "idle") {
      processFile(topFile, topUrl, setTopStatus, setTopProgress);
    }
  }, [topFile, topUrl, topStatus]);

  useEffect(() => {
    if ((modFile || modUrl) && modStatus === "idle") {
      processFile(modFile, modUrl, setModStatus, setModProgress);
    }
  }, [modFile, modUrl, modStatus]);

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
    if (!name.trim()) return;

    // Use default/existing if parsing wasn't done or failed, otherwise use parsed
    if (parsedContext) {
      onDataLoad(
        parsedContext.matrix,
        parsedContext.profiles,
        parsedContext.stacks,
      );
    }

    setCandidateName(name);
    // We would pass stack/profile selection to App if App needed it for logic,
    // but typically Assessment page handles the active stack view.
    // However, if we want to "Pre-select" the profile, we might need to store that in App state or pass it.
    // For now, onStart just resets scores.
    onStart();

    const sessionId = crypto.randomUUID();
    navigate(`/assessment/${sessionId}`);
  };

  const currentStacks = parsedContext
    ? Object.values(parsedContext.stacks)
    : existingStacks;
  const currentProfiles = parsedContext
    ? parsedContext.profiles
    : existingProfiles;

  // Handle moving to next step
  const canGoNext = profStatus === "done" && topStatus === "done";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FileText className="text-indigo-600 w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
            Technical Evaluation Portal
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Streamlined assessment process for engineering candidates. Configure
            your matrix and start a new session.
          </p>
        </header>

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
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Import Assessment Data
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Upload configuration files to build the matrix.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
                  <DataSourceInput
                    label="Role Profiles"
                    required
                    file={profFile}
                    setFile={setProfFile}
                    url={profUrl}
                    setUrl={setProfUrl}
                    status={profStatus}
                    progress={profProgress}
                  />
                  <DataSourceInput
                    label="Topics & Stacks"
                    required
                    file={topFile}
                    setFile={setTopFile}
                    url={topUrl}
                    setUrl={setTopUrl}
                    status={topStatus}
                    progress={topProgress}
                  />
                  <DataSourceInput
                    label="Module Summaries"
                    file={modFile}
                    setFile={setModFile}
                    url={modUrl}
                    setUrl={setModUrl}
                    status={modStatus}
                    progress={modProgress}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canGoNext}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleStart}
                className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300"
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Session Details
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Enter candidate and assessment context.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      Candidate Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Tech Stack
                      </label>
                      <select
                        value={selectedStackKey}
                        onChange={(e) => setSelectedStackKey(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select Stack...</option>
                        {currentStacks.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Role Profile
                      </label>
                      <select
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="">Select Profile...</option>
                        {currentProfiles.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <span>Start Assessment</span>
                  <ArrowRight size={20} />
                </button>
              </form>
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
