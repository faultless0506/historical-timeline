import React from "react";
import HistoricalTimeline from "./components/HistoricalTimeline";
import { Period } from "./components/HistoricalTimeline/types";
import { mockPeriods } from "./mockData";

// Моковые данные для демонстрации (от новых к старым)


const App: React.FC = () => {
  // Переворачиваем массив периодов, чтобы они отображались в порядке от старых к новым
  const sortedPeriods = [...mockPeriods].sort(
    (a, b) => a.startYear - b.startYear
  );

  return (
    <div className="app">
      <HistoricalTimeline periods={sortedPeriods} />
      <HistoricalTimeline periods={sortedPeriods} />
    </div>
  );
};

export default App;
