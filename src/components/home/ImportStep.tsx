import { ArrowRight } from "lucide-react";
import { DataSourceInput } from "./DataSourceInput";
import type { FileStatus } from "../../types";

interface ImportStepProps {
  profFile: File | null;
  setProfFile: (f: File | null) => void;
  profUrl: string;
  setProfUrl: (u: string) => void;
  profStatus: FileStatus;
  profProgress: number;
  profError: string | null;

  topFile: File | null;
  setTopFile: (f: File | null) => void;
  topUrl: string;
  setTopUrl: (u: string) => void;
  topStatus: FileStatus;
  topProgress: number;
  topError: string | null;

  modFile: File | null;
  setModFile: (f: File | null) => void;
  modUrl: string;
  setModUrl: (u: string) => void;
  modStatus: FileStatus;
  modProgress: number;
  modError: string | null;

  canGoNext: boolean;
  onNext: () => void;
}

export const ImportStep = ({
  profFile,
  setProfFile,
  profUrl,
  setProfUrl,
  profStatus,
  profProgress,
  profError,
  topFile,
  setTopFile,
  topUrl,
  setTopUrl,
  topStatus,
  topProgress,
  topError,
  modFile,
  setModFile,
  modUrl,
  setModUrl,
  modStatus,
  modProgress,
  modError,
  canGoNext,
  onNext,
}: ImportStepProps) => {
  return (
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
          label="Profiles"
          required
          file={profFile}
          setFile={setProfFile}
          url={profUrl}
          setUrl={setProfUrl}
          status={profStatus}
          progress={profProgress}
          error={profError}
        />
        <DataSourceInput
          label="Topics"
          required
          file={topFile}
          setFile={setTopFile}
          url={topUrl}
          setUrl={setTopUrl}
          status={topStatus}
          progress={topProgress}
          error={topError}
        />
        <DataSourceInput
          label="Modules"
          file={modFile}
          setFile={setModFile}
          url={modUrl}
          setUrl={setModUrl}
          status={modStatus}
          progress={modProgress}
          error={modError}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
