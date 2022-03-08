import { FC } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export const SearchField: FC<{
  placeholder?: string;
  onChange: (value: string) => void;
  searchThreshold?: number;
}> = ({ placeholder, onChange, searchThreshold = 3 }) => (
  <div className="searchBarContainer">
    <input
      className="search"
      placeholder={placeholder}
      onChange={(e) => {
        const query = e.currentTarget.value.toLowerCase();
        if (query.length === 0 || query.length >= searchThreshold)
          onChange(query);
      }}
    />
    <SearchIcon />
  </div>
);
