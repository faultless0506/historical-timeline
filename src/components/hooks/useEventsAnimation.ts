import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { HistoricalEvent } from "../HistoricalTimeline/types";

interface UseEventsAnimationProps {
  filteredEvents: HistoricalEvent[];
}

export const useEventsAnimation = ({
  filteredEvents,
}: UseEventsAnimationProps) => {
  const swiperRef = useRef<any>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef<boolean>(false);
  const [displayEvents, setDisplayEvents] =
    useState<HistoricalEvent[]>(filteredEvents);
  const [swiperKey, setSwiperKey] = useState(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [totalSlides, setTotalSlides] = useState<number>(0);

  // Обновляем отображаемые события с анимацией при изменении фильтров
  useEffect(() => {
    const animateEventsChange = async () => {
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

      // Обновление событий и пересоздание слайдера
      setDisplayEvents(filteredEvents);
      setSwiperKey((prev) => prev + 1);
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

  // Обработчик изменения слайда
  const handleSlideChange = (swiper: any) => {
    setActiveSlide(swiper.activeIndex);
  };

  // Обработчик инициализации слайдера
  const handleSwiperInit = (swiper: any) => {
    setTotalSlides(swiper.slides.length);
  };

  // Обработчик клика на индикатор пагинации
  const handlePaginationClick = (index: number) => {
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
