import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FiTrendingUp, FiUsers, FiAward, FiBarChart2 } from "react-icons/fi";
import { getResultsAPI } from "../services/api";
import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getResultsAPI();
      const data = response.data.results || [];
      setResults(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics from all candidates
  const allCandidates = results.flatMap((r) => r.candidates || []);
  const totalCandidates = allCandidates.length;
  const avgScore = totalCandidates
    ? (allCandidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates).toFixed(1)
    : 0;
  const topCandidate = allCandidates.length
    ? allCandidates.reduce((a, b) => (a.score > b.score ? a : b))
    : null;
  const goodCount = allCandidates.filter((c) => c.fit === "Good").length;
  const avgCount = allCandidates.filter((c) => c.fit === "Average").length;
  const poorCount = allCandidates.filter((c) => c.fit === "Poor").length;

  // Bar chart — Score distribution
  const barData = {
    labels: allCandidates.map((c) => c.name),
    datasets: [
      {
        label: "ATS Score",
        data: allCandidates.map((c) => c.score),
        backgroundColor: allCandidates.map((c) =>
          c.fit === "Good" ? "#22c55e" : c.fit === "Average" ? "#f59e0b" : "#ef4444"
        ),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Candidate Score Distribution", font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: "Score (%)" } },
    },
  };

  // Doughnut chart — Fit breakdown
  const doughnutData = {
    labels: ["Good", "Average", "Poor"],
    datasets: [
      {
        data: [goodCount, avgCount, poorCount],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: "Fit Breakdown", font: { size: 16 } },
    },
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

      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <SummaryCard
            title="Top Candidate"
            value={topCandidate ? topCandidate.name : "N/A"}
            subtitle={topCandidate ? `Score: ${topCandidate.score}%` : ""}
            icon={<FiAward />}
            color="green"
          />
          <SummaryCard
            title="Average Score"
            value={`${avgScore}%`}
            subtitle={`Across ${totalCandidates} candidates`}
            icon={<FiTrendingUp />}
            color="blue"
          />
          <SummaryCard
            title="Total Candidates"
            value={totalCandidates}
            subtitle={`${results.length} analysis run(s)`}
            icon={<FiUsers />}
            color="purple"
          />
          <SummaryCard
            title="Good Fit"
            value={goodCount}
            subtitle={`${avgCount} Average, ${poorCount} Poor`}
            icon={<FiBarChart2 />}
            color="yellow"
          />
        </div>

        {/* Charts */}
        {allCandidates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <Bar data={barData} options={barOptions} />
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
              <div className="w-72">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-slate-500 text-lg mb-4">No data yet</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer"
            >
              Upload Resumes to Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
