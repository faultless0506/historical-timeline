import { useState, useRef, useEffect } from "react";
import gsap from "gsap";

interface UseCategoryWheelProps {
  allCategories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string) => void;
}

export const useCategoryWheel = ({
  allCategories,
  selectedCategory,
  onCategoryChange,
}: UseCategoryWheelProps) => {
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [visibleCategory, setVisibleCategory] = useState<string | null>(
    selectedCategory
  );
  const [isCategoryChanging, setIsCategoryChanging] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  const categoryRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  // Начальный угол вращения для первой категории в правой верхней части (60 градусов)
  useEffect(() => {
    if (allCategories.length > 0) {
      const segmentAngle = 360 / allCategories.length;
      const initialRotation = -30 - 0 * segmentAngle; // 0 - индекс первой категории
      setRotationAngle(initialRotation);
    }
  }, [allCategories]);

  // Рассчитываем позиции точек на окружности по часовой стрелке
  const calculateDotPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI + Math.PI / 3;
    const radius = circleRef.current ? circleRef.current.offsetWidth / 2 : 265;
    const x = Math.cos(angle) * radius + radius;
    const y = Math.sin(angle) * radius + radius;
    return { x, y };
  };

  // Устанавливаем начальное положение точек и их позиций на окружности
  useEffect(() => {
    if (dotsRef.current && circleRef.current && allCategories.length > 0) {
      const dots = dotsRef.current.children;
      for (let i = 0; i < dots.length; i++) {
        const { x, y } = calculateDotPosition(i, allCategories.length);
        const dot = dots[i] as HTMLElement;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
      }

      if (selectedCategory && !isRotating) {
        const selectedIndex = allCategories.indexOf(selectedCategory);
        if (selectedIndex !== -1) {
          const angleForTopRight = -30; // Правый верхний угол
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

  // Обработчик клика по точке категории
  const handleDotClick = (category: string, index: number) => {
    // Предотвращаем повторные клики во время анимации
    if (isRotating || isCategoryChanging) return;

    if (selectedCategory === category) return;

    setIsRotating(true);

    // Анимируем смену категории
    setIsCategoryChanging(true);

    // Анимация исчезновения текущей категории
    if (categoryRef.current) {
      gsap.to(categoryRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setTimeout(() => {
            setVisibleCategory(category);

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
    }

    onCategoryChange(category);

    // Находим текущий выбранный индекс
    const currentSelectedIndex = allCategories.indexOf(selectedCategory || "");
    if (currentSelectedIndex === -1) return;

    // Определение направления вращения по кратчайшему пути
    const totalCategories = allCategories.length;

    // Расчет разницы позиций по часовой стрелке и против часовой стрелки
    const clockwiseDistance =
      (index - currentSelectedIndex + totalCategories) % totalCategories;
    const counterclockwiseDistance =
      (currentSelectedIndex - index + totalCategories) % totalCategories;

    // Выбираем направление вращения с минимальным расстоянием
    let angleChange;
    const segmentAngle = 360 / totalCategories;

    // Определяем количество шагов для вращения в кратчайшую сторону
    const steps = Math.min(clockwiseDistance, counterclockwiseDistance);

    if (clockwiseDistance <= counterclockwiseDistance) {
      // По часовой стрелке (отрицательное изменение для нашего интерфейса)
      angleChange = -clockwiseDistance * segmentAngle;
    } else {
      // Против часовой стрелки (положительное изменение)
      angleChange = counterclockwiseDistance * segmentAngle;
    }

    // Вычисляем целевой угол поворота
    const targetAngle = rotationAngle + angleChange;

    // Используем количество шагов для расчета длительности
    const duration = steps * 0.2;

    // Анимируем вращение круга с помощью GSAP
    if (dotsRef.current) {
      gsap.to(dotsRef.current, {
        rotation: targetAngle,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: function () {
          if (dotsRef.current) {
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

  // Обновляем позиции точек категорий при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
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
    rotationAngle,
    categoryRef,
    dotsRef,
    circleRef,
    handleDotClick,
  };
};
