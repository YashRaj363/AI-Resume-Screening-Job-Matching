const Spinner = ({ text = "Analyzing resumes..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-700 font-medium text-lg">{text}</p>
        <p className="text-slate-400 text-sm">This may take a moment...</p>
      </div>
    </div>
  );
};

export default Spinner;
