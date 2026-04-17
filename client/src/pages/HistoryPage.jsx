import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiClock, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { getHistoryAPI, getResultByIdAPI } from "../services/api";
import { useResults } from "../context/ResultsContext";
import Navbar from "../components/Navbar";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateResults } = useResults();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getHistoryAPI();
      setHistory(response.data.results || []);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const viewResult = async (resultId) => {
    try {
      const response = await getResultByIdAPI(resultId);
      updateResults(response.data.result);
      navigate("/results");
    } catch (error) {
      toast.error("Failed to load result details");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Analysis History</h1>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((result) => (
              <div
                key={result._id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => viewResult(result._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {result.jobDescription?.substring(0, 80) || "Job Analysis"}
                      {result.jobDescription?.length > 80 ? "..." : ""}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />
                        {formatDate(result.createdAt)}
                      </span>
                      <span>
                        {result.candidates?.length || 0} candidate(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Fit summary badges */}
                    {result.candidates && (
                      <div className="flex gap-1">
                        {result.candidates.filter((c) => c.fit === "Good").length > 0 && (
                          <span className="badge-good text-xs">
                            {result.candidates.filter((c) => c.fit === "Good").length} Good
                          </span>
                        )}
                        {result.candidates.filter((c) => c.fit === "Average").length > 0 && (
                          <span className="badge-average text-xs">
                            {result.candidates.filter((c) => c.fit === "Average").length} Avg
                          </span>
                        )}
                        {result.candidates.filter((c) => c.fit === "Poor").length > 0 && (
                          <span className="badge-poor text-xs">
                            {result.candidates.filter((c) => c.fit === "Poor").length} Poor
                          </span>
                        )}
                      </div>
                    )}
                    <FiArrowRight className="text-slate-400" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-slate-500 text-lg mb-4">No analysis history yet</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer"
            >
              Upload Your First Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
