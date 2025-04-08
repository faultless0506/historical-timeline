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
 *
 * @param {UsePeriodsProps} props - Свойства хука
 * @param {Period[]} props.periods - Массив исторических периодов
 * @param {() => void} [props.onPeriodChange] - Колбэк при изменении периода
 * @returns {Object} Объект с состояниями и методами для управления периодами
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
   * Анимирует изменение года с использованием GSAP
   * @param {number} from - Начальное значение года
   * @param {number} to - Конечное значение года
   * @param {React.Dispatch<React.SetStateAction<number>>} setter - Функция установки состояния
   * @param {React.RefObject<HTMLDivElement | null>} ref - Ссылка на DOM-элемент
   */
  const animateYearChange = (
    from: number,
    to: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    ref: React.RefObject<HTMLDivElement | null>
  ): void => {
    if (from === to) return;

    const duration = 0.3; // Длительность анимации в секундах
    const steps = Math.abs(to - from);
    const stepDuration = duration / steps;

    let currentValue = from;
    const isIncreasing = to > from;

    const timeline = gsap.timeline({
      onUpdate: () => {
        setter(Math.round(currentValue));
      },
      onComplete: () => {
        setter(to);
      },
    });

    timeline.to(
      {},
      {
        duration: duration,
        onUpdate: () => {
          const progress = timeline.progress();
          currentValue = from + (to - from) * progress;
        },
      }
    );
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
  }, [activePeriod]);

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
