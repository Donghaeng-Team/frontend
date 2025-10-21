import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import './CategorySelector.css';

export interface CategoryItem {
  value: string;
  label: string;
  children?: CategoryItem[];
}

interface CategorySelectorProps {
  data: CategoryItem[];
  value?: string[];  // [대분류, 중분류, 소분류, 상세]
  onChange?: (value: string[], labels: string[]) => void;
  placeholder?: string[];
  maxLevel?: 3 | 4;  // 3단계 또는 4단계
  className?: string;
  disabled?: boolean;
}

const CategorySelector: FC<CategorySelectorProps> = ({
  data,
  value = [],
  onChange,
  placeholder = ['대분류 선택', '중분류 선택', '소분류 선택', '세부분류 선택'],
  maxLevel = 4,
  className = '',
  disabled = false
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [categoryLevels, setCategoryLevels] = useState<CategoryItem[][]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const levelsRef = useRef<HTMLDivElement>(null);

  // data가 변경될 때만 초기화
  useEffect(() => {
    if (!data || data.length === 0) {
      setCategoryLevels([]);
      setSelectedValues([]);
      setSelectedLabels([]);
      return;
    }

    setCategoryLevels([data]);
  }, [data]);


  const handleSelect = (level: number, item: CategoryItem) => {
    const newValues = [...selectedValues.slice(0, level), item.value];
    const newLabels = [...selectedLabels.slice(0, level), item.label];

    // 선택한 레벨 이후 값들 초기화
    setSelectedValues(newValues);
    setSelectedLabels(newLabels);

    // 하위 카테고리 업데이트
    const newLevels = [...categoryLevels.slice(0, level + 1)];
    if (item.children && level < maxLevel - 1) {
      newLevels[level + 1] = item.children;
      // 하위 카테고리가 있으면 자동으로 다음 레벨로 스크롤
      setTimeout(() => scrollToLevel(level + 1), 300);
    }
    setCategoryLevels(newLevels);

    onChange?.(newValues, newLabels);
  };

  const levelTitles = ['대분류', '중분류', '소분류', '세부분류'];

  // 스크롤 이벤트 핸들러 - 현재 보이는 레벨 추적
  const handleScroll = () => {
    if (levelsRef.current) {
      const scrollLeft = levelsRef.current.scrollLeft;
      const levelWidth = levelsRef.current.offsetWidth;
      const newLevel = Math.round(scrollLeft / levelWidth);
      setCurrentLevel(newLevel);
    }
  };

  // 특정 레벨로 스크롤
  const scrollToLevel = (index: number) => {
    if (levelsRef.current) {
      levelsRef.current.scrollTo({
        left: index * levelsRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // 내부 스크롤 시 외부 스크롤 방지
  const handleWheel = (e: React.WheelEvent) => {
    const target = e.currentTarget as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 스크롤이 맨 위 또는 맨 아래에 도달했을 때만 외부 스크롤 허용
    if ((scrollTop === 0 && e.deltaY < 0) ||
        (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
      return; // 기본 동작 허용
    }

    e.stopPropagation(); // 외부 스크롤 이벤트 전파 차단
  };

  return (
    <div className={`category-selector ${className}`}>
      <div className="category-levels" ref={levelsRef} onScroll={handleScroll}>
        {Array.from({ length: maxLevel }, (_, index) => (
          <div key={index} className="category-level">
            <div className="category-level-header">
              <span className="category-level-title">{levelTitles[index]}</span>
            </div>
            <div
              className="category-level-content"
              onWheel={handleWheel}
            >
              {categoryLevels[index] ? (
                categoryLevels[index].map(item => (
                  <div
                    key={item.value}
                    className={`category-item ${selectedValues[index] === item.value ? 'category-item-selected' : ''}`}
                    onClick={() => handleSelect(index, item)}
                  >
                    {item.label}
                  </div>
                ))
              ) : index === 0 && data.length === 0 ? (
                <div className="category-loading">
                  카테고리 로딩 중...
                </div>
              ) : (
                <div className="category-placeholder">
                  {placeholder[index]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 모바일 인디케이터 dots */}
      <div className="category-indicators">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <button
            key={i}
            className={`indicator-dot ${currentLevel === i ? 'active' : ''}`}
            onClick={() => scrollToLevel(i)}
            aria-label={`${levelTitles[i]}로 이동`}
          />
        ))}
      </div>
      
      {selectedLabels.length > 0 && (
        <div className="category-selected-path">
          선택됨: {selectedLabels.join(' > ')}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;