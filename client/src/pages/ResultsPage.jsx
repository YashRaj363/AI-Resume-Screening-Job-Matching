import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUpload, FiClock } from "react-icons/fi";
import { getResultsAPI, deleteResumeAPI, replaceResumeAPI } from "../services/api";
import { useResults } from "../context/ResultsContext";
import Navbar from "../components/Navbar";
import ResultsTable from "../components/ResultsTable";
import Spinner from "../components/Spinner";

const ResultsPage = () => {
  const { latestResults, updateResults } = useResults();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Use context results first, fetch from API if not available
    if (latestResults) {
      setResults(Array.isArray(latestResults) ? latestResults : [latestResults]);
    } else {
      fetchResults();
    }
  }, [latestResults]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await getResultsAPI();
      setResults(response.data.results);
    } catch (error) {
      if (error.response?.status === 404) {
        setResults([]);
      } else {
        toast.error("Failed to load results");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resultId, candidateId) => {
    try {
      const response = await deleteResumeAPI(resultId, candidateId);
      toast.success("Candidate removed");
      // Update local state
      setResults((prev) =>
        prev.map((r) =>
          r._id === resultId ? response.data.result : r
        )
      );
    } catch (error) {
      toast.error("Failed to delete candidate");
    }
  };

  const handleReplace = async (resultId, candidateId, file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await replaceResumeAPI(resultId, candidateId, formData);
      toast.success("Resume replaced and re-analyzed");
      setResults((prev) =>
        prev.map((r) =>
          r._id === resultId ? response.data.result : r
        )
      );
    } catch (error) {
      toast.error("Failed to replace resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {loading && <Spinner text="Processing..." />}

      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">
          Analyzed Results
        </h1>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition cursor-pointer"
          >
            <FiUpload size={16} />
            Upload New
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg font-semibold transition cursor-pointer"
          >
            <FiClock size={16} />
            View History
          </button>
        </div>

        {/* Results grouped by job description */}
        {results && results.length > 0 ? (
          results.map((result) => (
            <div key={result._id} className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
              <div className="p-6 pb-2">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  {result.jobDescription?.substring(0, 60) || "Job Analysis"}
                  {result.jobDescription?.length > 60 ? "..." : ""}
                </h2>
              </div>
              <ResultsTable
                candidates={result.candidates}
                resultId={result._id}
                onDelete={handleDelete}
                onReplace={handleReplace}
              />
            </div>
          ))
        ) : !loading ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-4">No results found</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer"
            >
              Upload Resumes to Get Started
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResultsPage;
