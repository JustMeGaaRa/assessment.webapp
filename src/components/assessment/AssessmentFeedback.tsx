import { useState } from 'react';
import { Sparkles, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export interface AssessmentFeedbackProps {
  assessmentId: string;
  assessmentDate: string
  candidateName: string;
  profileName: string;
  technologyStack: string;
  summaryScore?: number;
  proficiencyLevel?: string;
  assessmentNotes: Array<{module: string, notes: string[]}>;
}

export const AssessmentFeedback = ({
  assessmentId,
  assessmentDate,
  candidateName,
  profileName: profileName,
  technologyStack: technologyStack,
  summaryScore: summaryScore,
  proficiencyLevel,
  assessmentNotes: assessmentNotes
}: AssessmentFeedbackProps) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showFullFeedback, setShowFullFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generateFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          assessmentDate,
          candidateName,
          profileName,
          technologyStack,
          summaryScore,
          proficiencyLevel,
          assessmentNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate feedback", { cause: response });
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(feedback);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Feedback Generation
        </h3>
      </div>

      {!feedback && (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <p className="text-slate-500 max-w-md">
                Generate a comprehensive summary of the candidate's performance using AI.
            </p>
            <button
                onClick={handleGenerateFeedback}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="animate-pulse">Generating...</span>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Generate Feedback
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {feedback && (
        <div className="mt-4 space-y-4">
            <div className="relative">
                <textarea
                    readOnly
                    value={feedback}
                    className="w-full min-h-[150px] p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    style={{ height: showFullFeedback ? 'auto' : '160px' }}
                    rows={showFullFeedback ? 20 : 5}
                />
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 bg-white rounded-md shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                    title="Copy to clipboard"
                >
                    <Copy size={16} />
                </button>
            </div>
            
            <div className="flex justify-center">
                 <button
                    onClick={() => setShowFullFeedback(!showFullFeedback)}
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    {showFullFeedback ? (
                        <>
                            Show Less <ChevronUp size={16} />
                        </>
                    ) : (
                        <>
                            Show More <ChevronDown size={16} />
                        </>
                    )}
                </button>
            </div>
            
             <div className="flex justify-end">
                <button
                    onClick={handleGenerateFeedback} // Regenerate
                    disabled={loading}
                    className="text-sm text-slate-500 hover:text-indigo-600 underline"
                >
                    Regenerate
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
