const SummaryCard = ({ title, value, subtitle, icon, color = "blue" }) => {
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${colorMap[color] || colorMap.blue}`} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div
              className={`text-3xl bg-gradient-to-r ${colorMap[color] || colorMap.blue} bg-clip-text text-transparent`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
