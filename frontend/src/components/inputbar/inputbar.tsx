import React, { useState, useRef, useEffect } from 'react';
import './inputbar.css';
import { socket } from '../../utils/socket';

interface InputBarProps {
  onInput?: (query: string) => void;
  conversationId: number;
}

const InputBar: React.FC<InputBarProps> = ({ onInput, conversationId }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onInput) {
      onInput(trimmed);
    }

    socket.emit('send_message', {
      conversationId,
      content: trimmed,
    });

    setQuery('');
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * 4 + 40;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

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
