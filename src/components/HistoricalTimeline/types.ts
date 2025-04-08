/**
 * Интерфейс исторического события
 *
 * @interface HistoricalEvent
 * @property {number} id - Уникальный идентификатор события
 * @property {number} year - Год события
 * @property {string} description - Описание события
 * @property {string} category - Категория события (для фильтрации)
 */
export interface HistoricalEvent {
  id: number;
  year: number;
  description: string;
  category: string;
}

/**
 * Интерфейс исторического периода
 *
 * @interface Period
 * @property {number} id - Уникальный идентификатор периода
 * @property {number} startYear - Начальный год периода
 * @property {number} endYear - Конечный год периода
 * @property {HistoricalEvent[]} events - Массив событий в периоде
 */
export interface Period {
  id: number;
  startYear: number;
  endYear: number;
  events: HistoricalEvent[];
}

/**
 * Свойства компонента HistoricalTimeline
 *
 * @interface HistoricalTimelineProps
 * @property {Period[]} periods - Массив исторических периодов для отображения
 * @property {string} [className] - Дополнительные CSS классы для компонента
 */
export interface HistoricalTimelineProps {
  periods: Period[];
  className?: string;
}
