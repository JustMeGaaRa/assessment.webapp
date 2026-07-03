import { useState, useEffect } from "react";
import type { FileStatus } from "../lib/state/v1/types";
import {
  CompetenceMatrix,
  Profile,
  ProficiencyLevel,
} from "@lib/matrix/types";
import { parseAssessmentData, validateCsvContent } from "../utils/csvHelpers";
import { getCompetencyMatrix, getProfile, getProficiencyLevel } from "@lib/state/v2/mappers";

interface UseConfigImportProps {
  hasProfiles: boolean;
  hasTopics: boolean;
  hasData: boolean;
  existingMatrix: CompetenceMatrix;
  existingProfiles: Profile[];
  existingLevelMappings: ProficiencyLevel[];
}

export const useConfigImport = ({
  hasProfiles,
  hasTopics,
  hasData,
  existingMatrix,
  existingProfiles,
  existingLevelMappings,
}: UseConfigImportProps) => {
  // Profiles
  const [profFile, setProfFile] = useState<File | null>(null);
  const [profUrl, setProfUrl] = useState("");
  const [profStatus, setProfStatus] = useState<FileStatus>("idle");
  const [profProgress, setProfProgress] = useState(0);
  const [profError, setProfError] = useState<string | null>(null);

  // Topics
  const [topFile, setTopFile] = useState<File | null>(null);
  const [topUrl, setTopUrl] = useState("");
  const [topStatus, setTopStatus] = useState<FileStatus>("idle");
  const [topProgress, setTopProgress] = useState(0);
  const [topError, setTopError] = useState<string | null>(null);

  // Modules
  const [modFile, setModFile] = useState<File | null>(null);
  const [modUrl, setModUrl] = useState("");
  const [modStatus, setModStatus] = useState<FileStatus>("idle");
  const [modProgress, setModProgress] = useState(0);
  const [modError, setModError] = useState<string | null>(null);

  // Levels
  const [levelFile, setLevelFile] = useState<File | null>(null);
  const [levelUrl, setLevelUrl] = useState("");
  const [levelStatus, setLevelStatus] = useState<FileStatus>("idle");
  const [levelProgress, setLevelProgress] = useState(0);
  const [levelError, setLevelError] = useState<string | null>(null);

  // Parsed Context Output
  const [parsedContext, setParsedContext] = useState<{
    matrix: CompetenceMatrix;
    profiles: Profile[];
    levelMappings: ProficiencyLevel[];
  } | null>(null);

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

  useEffect(() => {
    const profValid = hasProfiles
      ? profStatus === "idle" || profStatus === "done"
      : profStatus === "done";
    const topValid = hasTopics
      ? topStatus === "idle" || topStatus === "done"
      : topStatus === "done";

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
          setParsedContext(null);
          return;
        }

        try {
          const dataV1 = parseAssessmentData(filesToRead);

          let matrix = getCompetencyMatrix(dataV1.matrix);
          let profiles = dataV1.profiles.map(getProfile);
          let levelMappings = dataV1.levelMappings?.map(getProficiencyLevel) ?? [];

          if (hasData) {
            if (matrix.modules.length === 0) matrix = existingMatrix;
            if (profiles.length === 0) profiles = existingProfiles;
            if (levelMappings.length === 0) levelMappings = existingLevelMappings;
          }

          setParsedContext({ matrix, profiles, levelMappings });
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
    existingLevelMappings,
    hasProfiles,
    hasTopics,
  ]);

  const canImport =
    (hasProfiles
      ? profStatus === "idle" || profStatus === "done"
      : profStatus === "done") &&
    (hasTopics
      ? topStatus === "idle" || topStatus === "done"
      : topStatus === "done") &&
    (modStatus === "idle" || modStatus === "done") &&
    (levelStatus === "idle" || levelStatus === "done");

  const resetImportState = () => {
    setProfFile(null);
    setProfUrl("");
    setProfStatus("idle");
    setProfProgress(0);
    setProfError(null);

    setTopFile(null);
    setTopUrl("");
    setTopStatus("idle");
    setTopProgress(0);
    setTopError(null);

    setModFile(null);
    setModUrl("");
    setModStatus("idle");
    setModProgress(0);
    setModError(null);

    setLevelFile(null);
    setLevelUrl("");
    setLevelStatus("idle");
    setLevelProgress(0);
    setLevelError(null);

    setParsedContext(null);
  };

  return {
    profFile,
    setProfFile: handleProfFileChange,
    profUrl,
    setProfUrl: handleProfUrlChange,
    profStatus,
    profProgress,
    profError,

    topFile,
    setTopFile: handleTopFileChange,
    topUrl,
    setTopUrl: handleTopUrlChange,
    topStatus,
    topProgress,
    topError,

    modFile,
    setModFile: handleModFileChange,
    modUrl,
    setModUrl: handleModUrlChange,
    modStatus,
    modProgress,
    modError,

    levelsFile: levelFile,
    setLevelsFile: handleLevelFileChange,
    levelsUrl: levelUrl,
    setLevelsUrl: handleLevelUrlChange,
    levelsStatus: levelStatus,
    levelsProgress: levelProgress,
    levelsError: levelError,

    parsedContext,
    canImport,
    resetImportState,
  };
};
