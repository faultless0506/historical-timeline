import React, { useState, useEffect, useRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import gsap from "gsap";
import { HistoricalTimelineProps, Period, HistoricalEvent } from "./types";
import { useCategoryWheel } from "../hooks/useCategoryWheel";
import { usePeriods } from "../hooks/usePeriods";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/HistoricalTimeline.scss";

const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({
  periods,
  className = "",
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  const allCategories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    periods.forEach((period) => {
      period.events.forEach((event) => {
        if (event.category) {
          uniqueCategories.add(event.category);
        }
      });
    });
    return Array.from(uniqueCategories);
  }, [periods]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    allCategories[0] || null
  );

  // Используем хук для работы с периодами
  const {
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
  } = usePeriods({
    periods,
    onPeriodChange: () => setCurrentEventIndex(0),
  });

  // Фильтруем события по выбранной категории
  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return activePeriod?.events || [];

    return (
      activePeriod?.events.filter(
        (event: HistoricalEvent) => event.category === selectedCategory
      ) || []
    );
  }, [activePeriod, selectedCategory]);

  // Сбрасываем индекс события при изменении категории
  useEffect(() => {
    setCurrentEventIndex(0);
  }, [selectedCategory]);

  const swiperRef = useRef<any>(null);

  // Сбрасываем позицию слайдера при изменении периода или категории
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(0, 0);
    }
  }, [activePeriodIndex, selectedCategory]);

  // Используем хук для работы с колесом категорий
  const {
    isRotating,
    visibleCategory,
    isCategoryChanging,
    categoryRef,
    dotsRef,
    circleRef,
    handleDotClick,
  } = useCategoryWheel({
    allCategories,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
  });

  return (
    <div className="historical-timeline-container">
      <div className={`historical-timeline ${className}`}>
        <div className="historical-timeline__header">
          <h2 className="historical-timeline__title">
            Исторические
            <br /> даты
          </h2>
        </div>
        <div className="historical-timeline__circle-container">
          {visibleCategory && (
            <div
              ref={categoryRef}
              className="historical-timeline__active-category"
            >
              <span>{visibleCategory}</span>
            </div>
          )}
          <div className="historical-timeline__circle" ref={circleRef}>
            <div className="historical-timeline__dots" ref={dotsRef}>
              {allCategories.map((category, index) => (
                <div
                  key={category}
                  className={`historical-timeline__dot ${
                    selectedCategory === category
                      ? "historical-timeline__dot--active"
                      : ""
                  } ${isRotating ? "historical-timeline__dot--rotating" : ""}`}
                  onClick={() => handleDotClick(category, index)}
                  data-number={index + 1}
                  data-category={category}
                ></div>
              ))}
            </div>
          </div>
        </div>{" "}
        <div className="historical-timeline__years" ref={yearsRef}>
          <div className="historical-timeline__years-container">
            <div
              ref={startYearRef}
              className="historical-timeline__year historical-timeline__year--left"
              data-max={activePeriod?.startYear}
            >
              {displayStartYear}
            </div>
            <div
              ref={endYearRef}
              className="historical-timeline__year historical-timeline__year--right"
            >
              {displayEndYear}
            </div>
          </div>
        </div>
        <div className="historical-timeline__controls">
          <div className="historical-timeline__controls-counter">
            {String(activePeriodIndex + 1).padStart(2, "0")}/
            {String(totalPeriods).padStart(2, "0")}
          </div>
          <div className="historical-timeline__controls-buttons">
            <button
              className="historical-timeline__controls-button"
              onClick={handlePrevPeriod}
              disabled={activePeriodIndex === 0}
            >
              <svg viewBox="0 0 8 12">
                <path d="M7.41 10.59L2.83 6l4.58-4.59L6 0 0 6l6 6z" />
              </svg>
            </button>
            <button
              className="historical-timeline__controls-button"
              onClick={handleNextPeriod}
              disabled={activePeriodIndex === periods.length - 1}
            >
              <svg viewBox="0 0 8 12">
                <path d="M1.41 0L6 4.59 1.41 9.17 3 10.59 9 4.59 3 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="historical-timeline__events">
          <div className="historical-timeline__slider-prev"></div>
          <div className="historical-timeline__slider-next"></div>
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={4}
            spaceBetween={20}
            navigation={{
              prevEl: ".historical-timeline__slider-prev",
              nextEl: ".historical-timeline__slider-next",
            }}
            pagination={{
              clickable: true,
              type: "bullets",
              el: ".historical-timeline__pagination",
              bulletClass: "historical-timeline__pagination-bullet",
              bulletActiveClass:
                "historical-timeline__pagination-bullet--active",
              renderBullet: function (index, className) {
                return `<span class="${className}"></span>`;
              },
            }}
            onSlideChange={(swiper) => setCurrentEventIndex(swiper.activeIndex)}
            initialSlide={0}
            key={`${activePeriodIndex}-${selectedCategory}`}
            breakpoints={{
              180: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              320: {
                slidesPerView: 1.5,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 1.5,
                spaceBetween: 15,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="historical-timeline__swiper"
            ref={swiperRef}
          >
            {filteredEvents.map((event: HistoricalEvent) => (
              <SwiperSlide key={event.id}>
                <div className="historical-timeline__event">
                  <div className="historical-timeline__event-year">
                    {event.year}
                  </div>
                  <div className="historical-timeline__event-description">
                    {event.description}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="historical-timeline__pagination"></div>
      </div>
    </div>
  );
};

export default HistoricalTimeline;
