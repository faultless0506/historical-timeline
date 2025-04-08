import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { HistoricalEvent } from "../HistoricalTimeline/types";

interface UseEventsAnimationProps {
  filteredEvents: HistoricalEvent[];
}

/**
 * Хук для управления анимацией и состоянием событий в слайдере
 * Обеспечивает плавное переключение между наборами событий при смене периода или категории
 *
 * @param {Object} props - Параметры хука
 * @param {HistoricalEvent[]} props.filteredEvents - Массив отфильтрованных событий для отображения
 * @returns {Object} Объект с состояниями и методами для управления слайдером
 */
export const useEventsAnimation = ({
  filteredEvents,
}: UseEventsAnimationProps) => {
  // Ссылки на DOM-элементы и состояние анимации
  const swiperRef = useRef<any>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef<boolean>(false);

  // Состояния слайдера
  const [displayEvents, setDisplayEvents] =
    useState<HistoricalEvent[]>(filteredEvents);
  const [swiperKey, setSwiperKey] = useState(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [totalSlides, setTotalSlides] = useState<number>(0);

  /**
   * Эффект для анимации смены отображаемых событий
   */
  useEffect(() => {
    /**
     * Функция для анимации смены событий
     * Использует GSAP для плавного перехода между наборами данных
     */
    const animateEventsChange = async () => {
      // Проверка, что у нас есть доступ к DOM и нет активной анимации
      if (!swiperContainerRef.current || isAnimating.current) return;

      isAnimating.current = true;

      // Анимация исчезновения
      await new Promise<void>((resolve) => {
        gsap.to(swiperContainerRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power1.out",
          onComplete: resolve,
        });
      });

      // Обновление данных и сброс слайдера
      setDisplayEvents(filteredEvents);
      setSwiperKey((prev) => prev + 1); // Изменение ключа вызывает пересоздание компонента Swiper
      setActiveSlide(0);

      // Анимация появления
      if (swiperContainerRef.current) {
        gsap.to(swiperContainerRef.current, {
          opacity: 1,
          duration: 0.2,
          ease: "power1.in",
          onComplete: () => {
            isAnimating.current = false;
          },
        });
      }
    };

    animateEventsChange();
  }, [filteredEvents]);

  /**
   * Обработчик события изменения активного слайда
   */
  const handleSlideChange = (swiper: any): void => {
    setActiveSlide(swiper.activeIndex);
  };

  /**
   * Обработчик инициализации Swiper
   * Устанавливает общее количество слайдов
   */
  const handleSwiperInit = (swiper: any): void => {
    setTotalSlides(swiper.slides.length);
  };

  /**
   * Обработчик клика по элементу пагинации
   * Переключает слайдер на выбранный слайд
   *
   * @param {number} index - Индекс слайда для перехода
   */
  const handlePaginationClick = (index: number): void => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(index);
    }
  };

  return {
    swiperRef,
    swiperContainerRef,
    displayEvents,
    swiperKey,
    activeSlide,
    totalSlides,
    handleSlideChange,
    handleSwiperInit,
    handlePaginationClick,
  };
};
