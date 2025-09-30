import type { FC } from 'react';
import { useState, useEffect } from 'react';
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
}

const CategorySelector: FC<CategorySelectorProps> = ({
  data,
  value = [],
  onChange,
  placeholder = ['대분류 선택', '중분류 선택', '소분류 선택', '세부분류 선택'],
  maxLevel = 4,
  className = ''
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [categoryLevels, setCategoryLevels] = useState<CategoryItem[][]>([data]);

  useEffect(() => {
    // value prop이 변경되면 업데이트
    if (value.length > 0) {
      updateCategoryLevels(value);
    }
  }, [value, data]);

  const updateCategoryLevels = (values: string[]) => {
    const levels: CategoryItem[][] = [data];
    let currentLevel = data;

    values.forEach((val, index) => {
      const item = currentLevel.find(cat => cat.value === val);
      if (item?.children) {
        levels[index + 1] = item.children;
        currentLevel = item.children;
      }
    });

    setCategoryLevels(levels);
  };

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
    }
    setCategoryLevels(newLevels);

    onChange?.(newValues, newLabels);
  };

  const levelTitles = ['대분류', '중분류', '소분류', '세부분류'];

  return (
    <div className={`category-selector ${className}`}>
      <div className="category-levels">
        {Array.from({ length: maxLevel }, (_, index) => (
          <div key={index} className="category-level">
            <div className="category-level-header">
              <span className="category-level-title">{levelTitles[index]}</span>
            </div>
            <div className="category-level-content">
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
              ) : (
                <div className="category-placeholder">
                  {placeholder[index]}
                </div>
              )}
            </div>
          </div>
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