import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Period } from "../HistoricalTimeline/types";

interface UsePeriodsProps {
  periods: Period[];
  onPeriodChange?: () => void;
}

/**
 * Хук для управления историческими периодами
 * Обеспечивает переключение между периодами и анимацию изменения годов
 */
export const usePeriods = ({ periods, onPeriodChange }: UsePeriodsProps) => {
  // Основные состояния для работы с периодами
  const [activePeriodIndex, setActivePeriodIndex] = useState<number>(0);
  const [displayStartYear, setDisplayStartYear] = useState<number>(
    periods[0]?.startYear || 0
  );
  const [displayEndYear, setDisplayEndYear] = useState<number>(
    periods[0]?.endYear || 0
  );

  // Ссылки на DOM-элементы для анимации
  const yearsRef = useRef<HTMLDivElement>(null);
  const startYearRef = useRef<HTMLDivElement>(null);
  const endYearRef = useRef<HTMLDivElement>(null);

  // Вычисляемые значения
  const activePeriod = periods[activePeriodIndex];
  const totalPeriods = periods.length;

  /**
   * Анимирует изменение года по одной цифре
   * @param from - начальное значение года
   * @param to - конечное значение года
   * @param setter - функция установки состояния
   * @param ref - ссылка на DOM-элемент
   */
  const animateYearChange = (
    from: number,
    to: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    ref: React.RefObject<HTMLDivElement | null>
  ): void => {
    if (from === to) return;

    const isIncreasing = to > from;

    /**
     * Функция для анимации одного шага изменения года
     * @param currentValue - текущее значение года
     */
    const animateStep = (currentValue: number): void => {
      if (currentValue === to) return;

      const nextValue = isIncreasing ? currentValue + 1 : currentValue - 1;

      setter(nextValue);

      if (nextValue !== to) {
        setTimeout(() => animateStep(nextValue), 100);
      }
    };

    animateStep(from);
  };

  /**
   * Обновляем отображаемые годы при изменении активного периода
   */
  useEffect(() => {
    if (activePeriod) {
      // Анимируем изменение начального года
      animateYearChange(
        displayStartYear,
        activePeriod.startYear,
        setDisplayStartYear,
        startYearRef
      );

      // Анимируем изменение конечного года
      animateYearChange(
        displayEndYear,
        activePeriod.endYear,
        setDisplayEndYear,
        endYearRef
      );
    }
  }, [activePeriod, displayStartYear, displayEndYear]);

  /**
   * Переключение на предыдущий период
   */
  const handlePrevPeriod = (): void => {
    if (activePeriodIndex > 0) {
      setActivePeriodIndex((prev) => prev - 1);
      onPeriodChange?.();
    }
  };

  /**
   * Переключение на следующий период
   */
  const handleNextPeriod = (): void => {
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
