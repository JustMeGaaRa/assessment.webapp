import { DataSourceInput } from "./DataSourceInput";
import type { FileStatus } from "../../types";

interface ImportFormProps {
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

  levelsFile: File | null;
  setLevelsFile: (f: File | null) => void;
  levelsUrl: string;
  setLevelsUrl: (u: string) => void;
  levelsStatus: FileStatus;
  levelsProgress: number;
  levelsError: string | null;
  assessorName: string;
  setAssessorName: (name: string) => void;
  hasProfiles: boolean;
  hasTopics: boolean;
  hasModules: boolean; // Matrix exists, essentially
  hasLevelMappings: boolean;
}

export const ImportForm = ({
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
  levelsFile,
  setLevelsFile,
  levelsUrl,
  setLevelsUrl,
  levelsStatus,
  levelsProgress,
  levelsError,
  assessorName,
  setAssessorName,
  hasProfiles,
  hasTopics,
  hasModules,
  hasLevelMappings,
}: ImportFormProps) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Assessor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={assessorName}
            onChange={(e) => setAssessorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            required
          />
        </div>
        <div className="h-px bg-slate-200 my-4"></div>
        <DataSourceInput
          label="Profiles"
          required={!hasProfiles}
          isLoaded={hasProfiles}
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
          required={!hasTopics}
          isLoaded={hasTopics}
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
          isLoaded={hasModules}
        />
        <DataSourceInput
          label="Proficiency Levels"
          file={levelsFile}
          setFile={setLevelsFile}
          url={levelsUrl}
          setUrl={setLevelsUrl}
          status={levelsStatus}
          progress={levelsProgress}
          error={levelsError}
          isLoaded={hasLevelMappings}
        />
      </div>
    </div>
  );
};
