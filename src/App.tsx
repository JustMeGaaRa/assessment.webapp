import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Assessment } from "./pages/Assessment";
import { MatrixLibrary } from "./pages/MatrixLibrary";

const App = () => {
  // Assessment Data State (Lifted)
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [candidateName, setCandidateName] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Assessment
              scores={scores}
              setScores={setScores}
              notes={notes}
              setNotes={setNotes}
              candidateName={candidateName}
              setCandidateName={setCandidateName}
            />
          }
        />
        <Route path="/library" element={<MatrixLibrary />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
