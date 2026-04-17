import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const ResultsTable = ({ candidates, resultId, onDelete, onReplace }) => {
  const [replaceFiles, setReplaceFiles] = useState({});

  const handleFileChange = (candidateId, e) => {
    setReplaceFiles((prev) => ({
      ...prev,
      [candidateId]: e.target.files[0],
    }));
  };

  const handleReplace = (candidateId) => {
    const file = replaceFiles[candidateId];
    if (file) {
      onReplace(resultId, candidateId, file);
      setReplaceFiles((prev) => ({ ...prev, [candidateId]: null }));
    }
  };

  const getFitBadge = (fit) => {
    const classes = {
      Good: "badge-good",
      Average: "badge-average",
      Poor: "badge-poor",
    };
    return <span className={classes[fit] || "badge-poor"}>{fit}</span>;
  };

  const getMatchIcon = (match) => {
    if (match === "Yes" || match === "Matched" || match === true) {
      return <span className="text-green-600 font-semibold">✓ Matched</span>;
    }
    return <span className="text-red-500 font-semibold">✗ Not Matched</span>;
  };

  if (!candidates || candidates.length === 0) {
    return (
      <p className="text-slate-500 text-center py-8">No candidates to display.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#1e293b] text-white text-sm">
            <th className="px-4 py-3 text-left font-semibold">Rank</th>
            <th className="px-4 py-3 text-left font-semibold">Resume</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
            <th className="px-4 py-3 text-left font-semibold">Score (%)</th>
            <th className="px-4 py-3 text-left font-semibold">Fit</th>
            <th className="px-4 py-3 text-left font-semibold">Skills Matched</th>
            <th className="px-4 py-3 text-left font-semibold">Skills Missing</th>
            <th className="px-4 py-3 text-left font-semibold">Education</th>
            <th className="px-4 py-3 text-left font-semibold">Experience</th>
            <th className="px-4 py-3 text-left font-semibold">Semantic (%)</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr
              key={candidate._id || index}
              className="border-b border-slate-200 hover:bg-slate-50 transition"
            >
              {/* Rank */}
              <td className="px-4 py-4 text-center font-bold text-slate-700">
                {index + 1}
              </td>

              {/* Name */}
              <td className="px-4 py-4 font-medium text-slate-800">
                {candidate.name}
              </td>

              {/* Actions */}
              <td className="px-4 py-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(candidate._id, e)}
                    className="text-xs w-36"
                    id={`replace-${candidate._id}`}
                  />
                  <button
                    onClick={() => handleReplace(candidate._id)}
                    className="flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer"
                  >
                    <FiEdit2 size={12} />
                    Replace
                  </button>
                  <button
                    onClick={() => onDelete(resultId, candidate._id)}
                    className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer"
                  >
                    <FiTrash2 size={12} />
                    Delete
                  </button>
                </div>
              </td>

              {/* Score */}
              <td className="px-4 py-4 font-semibold text-slate-700">
                {candidate.score}
              </td>

              {/* Fit */}
              <td className="px-4 py-4">{getFitBadge(candidate.fit)}</td>

              {/* Skills Matched */}
              <td className="px-4 py-4 text-sm text-slate-600">
                {candidate.skillsMatched?.length > 0
                  ? candidate.skillsMatched.join(", ")
                  : "None"}
              </td>

              {/* Skills Missing */}
              <td className="px-4 py-4 text-sm text-slate-600">
                {candidate.skillsMissing?.length > 0
                  ? candidate.skillsMissing.join(", ")
                  : "None"}
              </td>

              {/* Education Match */}
              <td className="px-4 py-4">
                {getMatchIcon(candidate.educationMatch)}
              </td>

              {/* Experience Match */}
              <td className="px-4 py-4">
                {getMatchIcon(candidate.experienceMatch)}
              </td>

              {/* Semantic Score */}
              <td className="px-4 py-4 font-semibold text-slate-700">
                {candidate.semanticScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
