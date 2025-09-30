import React, { useState } from 'react';
import Input from '../Input';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "검색...",
  onSearch,
  fullWidth = false,
  size = 'medium'
}) => {
  const [value, setValue] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <div className={`search-bar ${fullWidth ? 'search-bar-full' : ''}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        size={size}
        fullWidth={fullWidth}
        icon="🔍"
        variant="filled"
      />
    </div>
  );
};

export default SearchBar;