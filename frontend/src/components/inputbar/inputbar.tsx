import React, { useState, useRef, useEffect } from 'react';
import './inputbar.css'; 

interface InputBarProps {
  onInput?: (query: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ onInput }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onInput) {
      onInput(query);
    }
    setQuery(''); 
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto'; // Reset
    const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * 4 + 40;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  // Ajuster la hauteur à chaque modification
  useEffect(() => {
    handleInput();
  }, [query]);

  return (
    <form className='input-form' onSubmit={handleSubmit}>
      <div className="fx fx-gap">
        <textarea
          ref={textareaRef}
          className='input-input'
          placeholder="Input"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={1}
        />
        <div id="input-icon">
          <button type="submit" className='input-button'>
            <div id="input-icon-circle"></div>
            <span></span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputBar;
