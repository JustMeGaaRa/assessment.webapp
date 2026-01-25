import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Assessment } from "./pages/Assessment";
import { MatrixLibrary } from "./pages/MatrixLibrary";
import { Home } from "./pages/Home";
import { ASSESSMENT_MATRIX, PROFILES, STACKS } from "./data";

const App = () => {
  // Master Data State
  const [matrix, setMatrix] = useState(ASSESSMENT_MATRIX);
  const [profiles, setProfiles] = useState(PROFILES);
  const [stacks, setStacks] = useState<Record<string, string>>(STACKS);

  // Assessment Data State (Lifted)
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [candidateName, setCandidateName] = useState("");

  const resetSession = () => {
    setScores({});
    setNotes({});
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              setCandidateName={setCandidateName}
              onStart={resetSession}
              onDataLoad={(m, p, s) => {
                setMatrix(m);
                setProfiles(p);
                setStacks(s);
              }}
              existingStacks={Object.values(stacks)}
              existingProfiles={profiles}
            />
          }
        />
        <Route
          path="/assessment/:sessionId"
          element={
            <Assessment
              scores={scores}
              setScores={setScores}
              notes={notes}
              setNotes={setNotes}
              candidateName={candidateName}
              setCandidateName={setCandidateName}
              matrix={matrix}
              stacks={stacks}
            />
          }
        />
        <Route
          path="/library"
          element={
            <MatrixLibrary
              matrix={matrix}
              profiles={profiles}
              stacks={stacks}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
