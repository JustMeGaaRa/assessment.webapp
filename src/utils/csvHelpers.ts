
// Simple CSV Parser handling basic quotes
const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        current += '"';
        i++; // Skip escape
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (current || row.length > 0) row.push(current.trim());
      if (row.length > 0) result.push(row);
      row = [];
      current = "";
      if (char === "\r" && nextChar === "\n") i++;
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current.trim());
    result.push(row);
  }
  return result;
};

export interface ParsedData {
  matrix: any[];
  profiles: any[];
  stacks: Record<string, string>;
}

export const parseAssessmentData = (
  files: { name: string; content: string; type: "profiles" | "topics" | "modules" }[]
): ParsedData => {
  let matrix: any[] = [];
  const profiles: any[] = [];
  // stacks is Record<KEY, Label> e.g. { DOTNET: ".NET" }
  let stacks: Record<string, string> = {}; 
  
  // Temporary storage
  const modulesMap = new Map<string, any>(); // Map<Code, Module>
  const profileWeightsMap = new Map<string, Record<string, number>>(); // Map<ProfileKey, { ModCode: Weight }>
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

        const topic = {
            id: topicId,
            name: topicName,
            weight: 1, // Default weight, not specified in CSV requirement, assuming 1 or logic
            mappings
        };
        
        // CSV spec didn't mention Topic Weight, defaulting logic:
        // Or maybe infer from somewhere? The prompt says "The fields for topics csv file are..." -> no weight mention.
        // We'll calculate module weights from profiles later, but individual topic weights internal to module?
        // Let's assume weight 1 for now or random distribution if not provided. 
        // Actually, previous data had topic weights. The prompt implies "The fields... are...". 
        // We will default to 1.
        
        modulesMap.get(modCode).topics.push(topic);
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
              modulesMap.get(modCode).description = summary;
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
          let rawName = headers[j];
          let pName = rawName.replace("%", "").trim();
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

  matrix = Array.from(modulesMap.values());
  return { matrix, profiles, stacks };
};
