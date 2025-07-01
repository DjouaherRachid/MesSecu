import React, { useState } from 'react';
import './searchbar.css'; 

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form className='search-form' onSubmit={handleSubmit}>
      <div className="fx fx-gap">
        <div>
          <input
            className='search-input'
            type="text"
            placeholder="Search"
            required
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (onSearch) {
                onSearch(e.target.value);
              }
            }}
          />
        </div>
        {/* <div id="search-icon">
          <button type="submit" className='search-button'>
            <div id="search-icon-circle"></div>
            <span></span>
          </button>
        </div> */}
      </div>
    </form>
  );
};

export default SearchBar;
