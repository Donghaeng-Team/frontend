import type { FC } from 'react';
import './Pagination.css';

interface PaginationProps {
  current: number;
  total: number;
  pageSize?: number;
  onChange?: (page: number) => void;
  showSizeChanger?: boolean;
  onSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Pagination: FC<PaginationProps> = ({
  current,
  total,
  pageSize = 10,
  onChange,
  showSizeChanger = false,
  onSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  showQuickJumper = false,
  showTotal = false,
  size = 'medium',
  className = ''
}) => {
  const totalPages = Math.ceil(total / pageSize);
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange?.(page);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onSizeChange?.(newSize);
  };

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = Number((e.target as HTMLInputElement).value);
      if (value >= 1 && value <= totalPages) {
        handlePageChange(value);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  return (
    <div className={`pagination pagination-${size} ${className}`}>
      {showTotal && (
        <span className="pagination-total">
          {startItem}-{endItem} / 총 {total}개
        </span>
      )}
      
      <div className="pagination-pages">
        <button
          className="pagination-item pagination-prev"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
        >
          ‹
        </button>
        
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                •••
              </span>
            );
          }
          return (
            <button
              key={page}
              className={`pagination-item ${current === page ? 'pagination-item-active' : ''}`}
              onClick={() => handlePageChange(page as number)}
            >
              {page}
            </button>
          );
        })}
        
        <button
          className="pagination-item pagination-next"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
        >
          ›
        </button>
      </div>
      
      {showSizeChanger && (
        <select 
          className="pagination-size-changer"
          value={pageSize}
          onChange={handleSizeChange}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size}개씩
            </option>
          ))}
        </select>
      )}
      
      {showQuickJumper && (
        <div className="pagination-jumper">
          <span>이동</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            onKeyPress={handleQuickJump}
            className="pagination-jumper-input"
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;