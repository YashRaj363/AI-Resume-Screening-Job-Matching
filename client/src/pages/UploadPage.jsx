import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiUpload, FiFileText, FiEdit3 } from "react-icons/fi";
import { uploadResumesAPI } from "../services/api";
import { useResults } from "../context/ResultsContext";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";

const UploadPage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [jdFiles, setJdFiles] = useState([]);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { updateResults } = useResults();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobDescription.trim() && jdFiles.length === 0) {
      toast.error("Please provide a job description");
      return;
    }
    if (resumeFiles.length === 0) {
      toast.error("Please upload at least one resume");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);

      for (const file of resumeFiles) {
        formData.append("resumes", file);
      }

      const response = await uploadResumesAPI(formData);
      updateResults(response.data.result);
      toast.success("Analysis complete!");
      navigate("/results");
    } catch (error) {
      toast.error(error.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {loading && <Spinner />}

      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
            Intelligent Resume Screening and
          </h1>
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-8">
            Job Matching System
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Description Files */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiFileText size={16} />
                Job Descriptions (PDF, multiple allowed)
              </label>
              <input
                id="jd-files"
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => setJdFiles(Array.from(e.target.files))}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
              />
            </div>

            {/* Job Description Text */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiEdit3 size={16} />
                Or Paste Job Description Text
              </label>
              <textarea
                id="jd-text"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                className="w-full border border-slate-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-y"
                placeholder="Paste job description here..."
              />
            </div>

            {/* Resume Files */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiUpload size={16} />
                Resumes (PDF, multiple allowed)
              </label>
              <input
                id="resume-files"
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => setResumeFiles(Array.from(e.target.files))}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm file:mr-3 file:py-1 file:px-4 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium hover:file:bg-slate-200"
              />
              {resumeFiles.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {resumeFiles.length} file(s) selected
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="analyze-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-lg font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiUpload size={18} />
              Analyze Results
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
