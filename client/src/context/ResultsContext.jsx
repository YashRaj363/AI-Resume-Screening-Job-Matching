import { createContext, useContext, useState } from "react";

const ResultsContext = createContext(null);

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
};

export const ResultsProvider = ({ children }) => {
  const [latestResults, setLatestResults] = useState(null);

  const updateResults = (results) => {
    setLatestResults(results);
  };

  const clearResults = () => {
    setLatestResults(null);
  };

  return (
    <ResultsContext.Provider
      value={{ latestResults, updateResults, clearResults }}
    >
      {children}
    </ResultsContext.Provider>
  );
};

export default ResultsContext;
