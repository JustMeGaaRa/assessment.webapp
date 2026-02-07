import { useState, useCallback } from "react";
import {
  FileSpreadsheet,
  Check,
  Loader2,
  AlertCircle,
  UploadCloud,
  Link as LinkIcon,
} from "lucide-react";
import type { FileStatus } from "../../types";

type DataSourceMode = "file" | "url";

interface DataSourceInputProps {
  label: string;
  required?: boolean;
  file: File | null;
  setFile: (f: File | null) => void;
  url: string;
  setUrl: (u: string) => void;
  status: FileStatus;
  progress: number;
  error: string | null;
  isLoaded?: boolean;
}

export const DataSourceInput = ({
  label,
  required,
  file,
  setFile,
  url,
  setUrl,
  status,
  progress,
  error,
  isLoaded,
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
          {isLoaded && !required && (
            <span className="text-[10px] ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider rounded-full border border-emerald-100 flex items-center gap-1">
              <Check size={10} strokeWidth={3} />
              Loaded
            </span>
          )}
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
        {status !== "idle" && status !== "error" ? (
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
                : error
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className={`p-2 rounded-full mb-2 group-hover:scale-110 transition-transform ${error ? "bg-red-100 text-red-500" : "bg-indigo-50 text-indigo-500"}`}
            >
              {error ? <AlertCircle size={20} /> : <UploadCloud size={20} />}
            </div>
            <p className="text-xs font-semibold text-slate-600">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <>
                  <span className="text-indigo-600">Click</span> or drag csv
                </>
              )}
            </p>
            {error && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setFile(null); // Clear file to reset
                }}
                className="mt-2 text-[10px] font-bold text-slate-400 underline hover:text-slate-600 z-10 relative"
              >
                Try Again
              </button>
            )}
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
