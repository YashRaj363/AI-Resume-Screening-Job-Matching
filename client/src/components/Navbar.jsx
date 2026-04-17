import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUpload, FiClock, FiLogOut, FiBarChart2 } from "react-icons/fi";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-[#1e293b] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            Intelligent Resume Screening and Job Matching System
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition"
              >
                <FiBarChart2 size={16} />
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition"
              >
                <FiUpload size={16} />
                Upload
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition"
              >
                <FiClock size={16} />
                History
              </Link>
              {user && (
                <span className="text-sm text-slate-300 ml-2">
                  Hello, {user.username}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition cursor-pointer"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
