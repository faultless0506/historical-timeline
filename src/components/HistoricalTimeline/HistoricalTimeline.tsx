import React, { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { HistoricalTimelineProps, HistoricalEvent } from "./types";
import { useCategoryWheel } from "../hooks/useCategoryWheel";
import { usePeriods } from "../hooks/usePeriods";
import { useEventsAnimation } from "../hooks/useEventsAnimation";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/HistoricalTimeline.scss";

/**
 * Компонент исторической временной шкалы
 * Отображает периоды истории и события в них с возможностью
 * фильтрации по категориям и переключения между периодами
 *
 * @param {HistoricalTimelineProps} props - Свойства компонента
 * @param {Period[]} props.periods - Массив исторических периодов
 * @param {string} [props.className=""] - Дополнительные CSS классы
 * @returns {React.ReactElement} - Компонент исторической временной шкалы
 */
const HistoricalTimeline = ({
  periods,
  className = "",
}: HistoricalTimelineProps): React.ReactElement => {
  // Извлекаем все уникальные категории из событий всех периодов
  // на всякий случай для защиты верстки ограничим 6 элементами
  const allCategories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    periods.forEach((period) => {
      period.events.forEach((event) => {
        if (event.category) {
          uniqueCategories.add(event.category);
        }
      });
    });
    return Array.from(uniqueCategories).slice(0, 6);
  }, [periods]);

  // Состояние выбранной категории, начальное значение - первая категория
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    allCategories[0] || null
  );

  // Хук для управления периодами (переключение, анимация годов)
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
  } = usePeriods({ periods });

  // Фильтрация событий активного периода по выбранной категории
  const filteredEvents = useMemo(() => {
    if (!selectedCategory) return activePeriod?.events || [];

    return (
      activePeriod?.events.filter(
        (event: HistoricalEvent) => event.category === selectedCategory
      ) || []
    );
  }, [activePeriod, selectedCategory]);

  // Хук для анимации событий при изменении фильтров или периода
  const {
    swiperRef,
    swiperContainerRef,
    displayEvents,
    swiperKey,
    activeSlide,
    totalSlides,
    handleSlideChange,
    handleSwiperInit,
    handlePaginationClick,
  } = useEventsAnimation({
    filteredEvents,
  });

  // Хук для управления колесом выбора категорий
  const {
    isRotating,
    visibleCategory,
    categoryRef,
    dotsRef,
    circleRef,
    handleDotClick,
  } = useCategoryWheel({
    allCategories,
    selectedCategory,
    onCategoryChange: setSelectedCategory,
  });

  // Форматирование номера периода для отображения (01/03)
  const formattedPeriodIndex = String(activePeriodIndex + 1).padStart(2, "0");
  const formattedTotalPeriods = String(totalPeriods).padStart(2, "0");

  return (
    <div className="historical-timeline-container">
      <div className={`historical-timeline ${className}`}>
        {/* Заголовок */}
        <div className="historical-timeline__header">
          <h2 className="historical-timeline__title">
            Исторические
            <br /> даты
          </h2>
        </div>

        {/* Колесо выбора категорий */}
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
        </div>

        {/* Годы периода */}
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

        {/* Управление периодами */}
        <div className="historical-timeline__controls">
          <div className="historical-timeline__controls-counter">
            {formattedPeriodIndex}/{formattedTotalPeriods}
          </div>
          <div className="historical-timeline__controls-buttons">
            <button
              className="historical-timeline__controls-button"
              onClick={handlePrevPeriod}
              disabled={activePeriodIndex === 0}
              aria-label="Предыдущий период"
            >
              <svg viewBox="0 0 8 12">
                <path d="M7.41 10.59L2.83 6l4.58-4.59L6 0 0 6l6 6z" />
              </svg>
            </button>
            <button
              className="historical-timeline__controls-button"
              onClick={handleNextPeriod}
              disabled={activePeriodIndex === periods.length - 1}
              aria-label="Следующий период"
            >
              <svg viewBox="0 0 8 12">
                <path d="M1.41 0L6 4.59 1.41 9.17 3 10.59 9 4.59 3 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Слайдер событий */}
        <div className="historical-timeline__events">
          <div className="historical-timeline__slider-prev"></div>
          <div className="historical-timeline__slider-next"></div>
          <div
            ref={swiperContainerRef}
            className="historical-timeline__swiper-container"
          >
            <Swiper
              key={swiperKey}
              modules={[Navigation, Pagination]}
              slidesPerView={4}
              spaceBetween={20}
              navigation={{
                prevEl: ".historical-timeline__slider-prev",
                nextEl: ".historical-timeline__slider-next",
              }}
              onSlideChange={handleSlideChange}
              onSwiper={handleSwiperInit}
              initialSlide={0}
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
              {displayEvents.map((event) => (
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
        </div>

        {/* Пагинация слайдера */}
        <div className="historical-timeline__pagination-container">
          <div className="historical-timeline__pagination">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <span
                key={index}
                className={`historical-timeline__pagination-bullet ${
                  index === activeSlide
                    ? "historical-timeline__pagination-bullet--active"
                    : ""
                }`}
                onClick={() => handlePaginationClick(index)}
                aria-label={`Слайд ${index + 1}`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTimeline;
