export interface HistoricalEvent {
  id: number;
  year: number;
  description: string;
  category: string;
}

export interface Period {
  id: number;
  startYear: number;
  endYear: number;
  events: HistoricalEvent[];
}

export interface HistoricalTimelineProps {
  periods: Period[];
  className?: string;
}
