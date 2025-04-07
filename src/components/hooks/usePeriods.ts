import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Period } from "../HistoricalTimeline/types";

interface UsePeriodsProps {
  periods: Period[];
  onPeriodChange?: () => void;
}

export const usePeriods = ({ periods, onPeriodChange }: UsePeriodsProps) => {
  const [activePeriodIndex, setActivePeriodIndex] = useState<number>(0);
  const [displayStartYear, setDisplayStartYear] = useState<number>(
    periods[0]?.startYear || 0
  );
  const [displayEndYear, setDisplayEndYear] = useState<number>(
    periods[0]?.endYear || 0
  );

  const yearsRef = useRef<HTMLDivElement>(null);
  const startYearRef = useRef<HTMLDivElement>(null);
  const endYearRef = useRef<HTMLDivElement>(null);

  const activePeriod = periods[activePeriodIndex];
  const totalPeriods = periods.length;

  // Функция для анимации изменения года по одной цифре
  const animateYearChange = (
    from: number,
    to: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (from === to) return;

    const isIncreasing = to > from;

    // Функция для анимации одного шага
    const animateStep = (currentValue: number) => {
      if (currentValue === to) return;

      const nextValue = isIncreasing ? currentValue + 1 : currentValue - 1;

      setter(nextValue);

      if (nextValue !== to) {
        setTimeout(() => animateStep(nextValue), 100);
      }
    };

    animateStep(from);
  };

  // Обновляем отображаемые годы при изменении активного периода
  useEffect(() => {
    if (activePeriod) {
      animateYearChange(
        displayStartYear,
        activePeriod.startYear,
        setDisplayStartYear,
        startYearRef
      );
      animateYearChange(
        displayEndYear,
        activePeriod.endYear,
        setDisplayEndYear,
        endYearRef
      );
    }
  }, [activePeriod]);

  // Обработчики для переключения периодов
  const handlePrevPeriod = () => {
    if (activePeriodIndex > 0) {
      setActivePeriodIndex((prev) => prev - 1);
      onPeriodChange?.();
    }
  };

  const handleNextPeriod = () => {
    if (activePeriodIndex < periods.length - 1) {
      setActivePeriodIndex((prev) => prev + 1);
      onPeriodChange?.();
    }
  };

  return {
    activePeriodIndex,
    activePeriod,
    totalPeriods,
    displayStartYear,
    displayEndYear,
    yearsRef,
    startYearRef,
    endYearRef,
    handlePrevPeriod,
    handleNextPeriod,
    setActivePeriodIndex,
  };
};
