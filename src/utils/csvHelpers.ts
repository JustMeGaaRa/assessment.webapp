import type { ModuleState, ProfileState, Topic, AppDataState, LevelMapping } from "../types";

import Papa from "papaparse";

// Simple CSV Parser handling basic quotes using PapaParse
const parseCSV = (text: string): string[][] => {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: 'greedy', // Skip lines that are empty or contain only whitespace
    transform: (value) => value.trim(), // Mimic original behavior of trimming values
  });
  return result.data;
};

export const validateCsvContent = (content: string, type: "profiles" | "topics" | "modules" | "levels"): string | null => {
  const rows = parseCSV(content);
  if (rows.length === 0) return "File is empty";
  
  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  const hasField = (field: string) => headers.includes(field.toLowerCase());

  if (type === "topics") {
     const required = ["module code", "module name", "topic"];
     const missing = required.filter(f => !hasField(f));
     if (missing.length > 0) {
         return `Missing required columns: ${missing.map(m => `"${m}"`).join(", ")}`;
     }
  }

  if (type === "modules") {
     const required = ["module code", "module name", "module summary"];
     const missing = required.filter(f => !hasField(f));
     if (missing.length > 0) {
         return `Missing required columns: ${missing.map(m => `"${m}"`).join(", ")}`;
     }
  }

  if (type === "profiles") {
      const required = ["module code", "module name"];
      const missing = required.filter(f => !hasField(f));
      if (missing.length > 0) {
          return `Missing required columns: ${missing.map(m => `"${m}"`).join(", ")}`;
      }
      // Check for at least one profile column?
      if (headers.length <= required.length) {
          return "Profiles file must contain at least one profile column";
      }
  }

  if (type === "levels") {
      const required = ["level", "min score", "max score"];
      const missing = required.filter(f => !hasField(f));
      if (missing.length > 0) {
          return `Missing required columns: ${missing.map(m => `"${m}"`).join(", ")}`;
      }
  }
  return null;
}

export const parseAssessmentData = (
  files: { name: string; content: string; type: "profiles" | "topics" | "modules" | "levels" }[]
): AppDataState => {
  let matrix: ModuleState[] = [];
  const profiles: ProfileState[] = [];
  // stacks is Record<KEY, Label> e.g. { DOTNET: ".NET" }
  const stacks: Record<string, string> = {}; 
  
  // Temporary storage
  const modulesMap = new Map<string, ModuleState>(); // Map<Code, Module>
  // Profile logic doesn't use profileWeightsMap currently, it writes directly to profiles array, so removing unused map.
  const stackKeys: string[] = [];

  // 1. Parse Topics (Required for Stacks and Base Modules)
  const topicsFile = files.find(f => f.type === "topics");
  if (topicsFile) {
    const rows = parseCSV(topicsFile.content);
    const headers = rows[0]; // Module Code, Module Name, Topic, <Stack 1>, <Stack 2>...
    
    // Infer Stacks from index 3 onwards
    for (let i = 3; i < headers.length; i++) {
      const stackName = headers[i];
      // Create a key, e.g., ".NET" -> "DOTNET", "React" -> "REACT"
      // For simplicity, we just use the name as key if it's safe, or simple slug
      const key = stackName.toUpperCase().replace(/[^A-Z0-9]/g, "");
      stacks[key] = stackName;
      stackKeys.push(stackName);
    }

    // Process Rows
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3) continue;

        const modCode = row[0];
        const modName = row[1];
        const topicName = row[2];
        const topicId = `t-${modCode}-${i}`; // Generate ID

        if (!modulesMap.has(modCode)) {
            modulesMap.set(modCode, {
                id: modCode,
                title: modName,
                description: "", // Will be filled by modules file if present
                topics: []
            });
        }

        const mappings: Record<string, string> = {};
        // Map stacks
        for (let s = 0; s < stackKeys.length; s++) {
             // row indices for stacks start at 3
             const content = row[3 + s];
             if (content) {
                 const stackLabel = stackKeys[s]; // e.g., ".NET"
                 mappings[stackLabel] = content;
             }
        }

        const topic: Topic = {
            id: topicId,
            name: topicName,
            weight: 1, // Default weight, not specified in CSV requirement, assuming 1 or logic
            mappings
        };
        
        modulesMap.get(modCode)!.topics.push(topic);
    }
  }

  // 2. Parse Modules (Optional updates)
  const modulesFile = files.find(f => f.type === "modules");
  if (modulesFile) {
      const rows = parseCSV(modulesFile.content);
      // Headers: Module Code, Module Name, Module Summary
      for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 3) continue;
          const modCode = row[0];
          const summary = row[2];
          
          if (modulesMap.has(modCode)) {
              modulesMap.get(modCode)!.description = summary;
          }
      }
  }

  // 3. Parse Profiles
  const profilesFile = files.find(f => f.type === "profiles");
  if (profilesFile) {
      const rows = parseCSV(profilesFile.content);
      const headers = rows[0]; // Module Code, Module Name, <Prof 1> %, <Prof 2> %, ...
      
      const profileNames: string[] = [];
      for (let j = 2; j < headers.length; j++) {
          // Header might be "Mid-Level .NET %"
          // Clean it
          const rawName = headers[j];
          const pName = rawName.replace("%", "").trim();
          profileNames.push(pName);
          
          // Initialize profile entry
          const pId = `p-${j}`;
          // Infer stack? Profiles usually belong to a stack. 
          // Heuristic: Check if profile name contains a known stack name.
          let stack = "General";
          const knownStacks = Object.values(stacks);
          for(const s of knownStacks) {
              if (pName.toLowerCase().includes(s.toLowerCase())) {
                  stack = s;
                  break;
              }
          }

          if (!profiles[j-2]) {
            profiles[j-2] = {
              id: pId,
              title: pName,
              stack: stack, 
              description: `Profile for ${pName}`,
              weights: {}
            };
          }
      }

      // Process Rows for Weights
      for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const modCode = row[0];
          
          for (let j = 0; j < profileNames.length; j++) {
             // value at index 2 + j
             const val = parseFloat(row[2 + j]);
             if (!isNaN(val)) {
                 profiles[j].weights[modCode] = val;
             }
          }
      }
  }



  // 4. Parse Levels
  const levelMappings: LevelMapping[] = [];
  const levelsFile = files.find(f => f.type === "levels");
  if (levelsFile) {
      const rows = parseCSV(levelsFile.content);
      // Skip header, assuming headers are validated
      for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 3) continue;
          
          const levelName = row[0];
          // Handle cases where numbers might be strings with commas or quotes
          const rawMin = row[1];
          const rawMax = row[2];
          
          const cleanFloat = (val: string) => {
              if (typeof val !== 'string') return parseFloat(val);
              // remove quotes if csv parser didn't already
              let cleaned = val.replace(/['"]+/g, '');
              cleaned = cleaned.replace(",", ".");
              return parseFloat(cleaned);
          };

          const minScore = cleanFloat(rawMin);
          const maxScore = cleanFloat(rawMax);
          
          if (!isNaN(minScore) && !isNaN(maxScore) && levelName) {
              levelMappings.push({
                  level: levelName,
                  minScore,
                  maxScore
              });
          }
      }
  }

  matrix = Array.from(modulesMap.values());
  return { matrix, profiles, stacks, levelMappings };
};
