import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

interface UseCategoryWheelProps {
  allCategories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string) => void;
}

/**
 * Хук для управления круговым селектором категорий
 * Обеспечивает вращение круга и анимацию при выборе категории
 */
export const useCategoryWheel = ({
  allCategories,
  selectedCategory,
  onCategoryChange,
}: UseCategoryWheelProps) => {
  // Основные состояния для управления колесом категорий
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(
    selectedCategory
  );
  const [isCategoryChanging, setIsCategoryChanging] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Ссылки на DOM-элементы
  const categoryRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  /**
   * Установка начального угла вращения для первой категории
   */
  useEffect(() => {
    if (allCategories.length > 0) {
      const segmentAngle = 360 / allCategories.length;
      const initialRotation = -30 - 0 * segmentAngle; // 0 - индекс первой категории
      setRotationAngle(initialRotation);
    }
  }, [allCategories]);

  /**
   * Расчет координат позиции точки на окружности
   * @param index - индекс категории
   * @param total - общее количество категорий
   * @returns - координаты {x, y} точки
   */
  const calculateDotPosition = (
    index: number,
    total: number
  ): { x: number; y: number } => {
    // Угол в радианах с учетом смещения на 60 градусов (π/3)
    const angle = (index / total) * 2 * Math.PI + Math.PI / 3;
    // Радиус окружности
    const radius = circleRef.current ? circleRef.current.offsetWidth / 2 : 265;
    // Расчет координат
    const x = Math.cos(angle) * radius + radius;
    const y = Math.sin(angle) * radius + radius;
    return { x, y };
  };

  /**
   * Установка позиций точек на окружности и поворот круга к выбранной категории
   */
  useEffect(() => {
    if (dotsRef.current && circleRef.current && allCategories.length > 0) {
      // Расстановка точек равномерно по окружности
      const dots = dotsRef.current.children;
      for (let i = 0; i < dots.length; i++) {
        const { x, y } = calculateDotPosition(i, allCategories.length);
        const dot = dots[i] as HTMLElement;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
      }

      // Если есть выбранная категория и нет анимации вращения,
      // поворачиваем круг так, чтобы эта категория оказалась в верхней точке
      if (selectedCategory && !isRotating) {
        const selectedIndex = allCategories.indexOf(selectedCategory);
        if (selectedIndex !== -1) {
          const angleForTopRight = -60; // Правый верхний угол
          const currentPosition =
            (selectedIndex / allCategories.length) * 360 + 60; // Текущая позиция в градусах
          const neededRotation = angleForTopRight - currentPosition;

          // Устанавливаем точку трансформации в центр круга
          gsap.set(dotsRef.current, {
            transformOrigin: "center center",
            rotation: neededRotation,
          });

          // Обновляем CSS переменную для противовращения чисел
          dotsRef.current.style.setProperty(
            "--rotation",
            `${neededRotation}deg`
          );

          // Обновляем угол поворота
          setRotationAngle(neededRotation);
        }
      }
    }
  }, [allCategories, selectedCategory, isRotating]);

  /**
   * Обработчик клика по точке категории
   * @param category - выбранная категория
   * @param index - индекс выбранной категории
   */
  const handleDotClick = (category: string, index: number): void => {
    // Игнорируем клики во время анимации или если категория уже выбрана
    if (isRotating || isCategoryChanging || selectedCategory === category)
      return;

    setIsRotating(true);
    setIsCategoryChanging(true);

    // Анимация смены текста категории
    animateCategoryChange(category);

    // Сообщаем о выборе новой категории
    onCategoryChange(category);

    // Анимация вращения круга
    animateWheelRotation(index);
  };

  /**
   * Анимация смены текста категории
   * @param newCategory - новая выбранная категория
   */
  const animateCategoryChange = (newCategory: string): void => {
    if (!categoryRef.current) return;

    // Анимация исчезновения текущей категории
    gsap.to(categoryRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        // Задержка перед показом новой категории
        setTimeout(() => {
          setVisibleCategory(newCategory);

          // Анимация появления новой категории
          gsap.fromTo(
            categoryRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.2,
              onComplete: () => {
                setIsCategoryChanging(false);
              },
            }
          );
        }, 150);
      },
    });
  };

  /**
   * Анимация вращения круга к выбранной категории
   * @param newIndex - индекс новой выбранной категории
   */
  const animateWheelRotation = (newIndex: number): void => {
    // Находим текущий выбранный индекс
    const currentSelectedIndex = allCategories.indexOf(selectedCategory || "");
    if (currentSelectedIndex === -1) return;

    const totalCategories = allCategories.length;

    // Расчет оптимального направления вращения
    const clockwiseDistance =
      (newIndex - currentSelectedIndex + totalCategories) % totalCategories;
    const counterclockwiseDistance =
      (currentSelectedIndex - newIndex + totalCategories) % totalCategories;

    // Выбираем кратчайший путь для вращения
    const steps = Math.min(clockwiseDistance, counterclockwiseDistance);
    const segmentAngle = 360 / totalCategories;

    let angleChange;
    if (clockwiseDistance <= counterclockwiseDistance) {
      // По часовой стрелке (отрицательное изменение)
      angleChange = -clockwiseDistance * segmentAngle;
    } else {
      // Против часовой стрелки (положительное изменение)
      angleChange = counterclockwiseDistance * segmentAngle;
    }

    // Целевой угол поворота
    const targetAngle = rotationAngle + angleChange;
    // Длительность анимации зависит от количества шагов
    const duration = steps * 0.2;

    // Применяем анимацию вращения с помощью GSAP
    if (dotsRef.current) {
      gsap.to(dotsRef.current, {
        rotation: targetAngle,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: function () {
          if (dotsRef.current) {
            // Получаем текущий угол вращения и обновляем CSS-переменную
            const currentRotation = gsap.getProperty(
              dotsRef.current,
              "rotation"
            );
            dotsRef.current.style.setProperty(
              "--rotation",
              `${currentRotation}deg`
            );
          }
        },
        onComplete: () => {
          setRotationAngle(targetAngle);
          setIsRotating(false);
        },
      });
    }
  };

  /**
   * Обновление позиций точек при изменении размера окна
   */
  useEffect(() => {
    const handleResize = (): void => {
      if (dotsRef.current && circleRef.current) {
        const dots = dotsRef.current.children;
        for (let i = 0; i < dots.length; i++) {
          const { x, y } = calculateDotPosition(i, allCategories.length);
          const dot = dots[i] as HTMLElement;
          dot.style.left = `${x}px`;
          dot.style.top = `${y}px`;
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [allCategories.length]);

  return {
    isRotating,
    visibleCategory,
    isCategoryChanging,
    categoryRef,
    dotsRef,
    circleRef,
    handleDotClick,
  };
};
