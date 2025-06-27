import React from 'react';
import { MessageRead } from '../../types/message';

interface SeenInfoPopupProps {
  reads: MessageRead[];
  setShowPopup: (show: boolean) => void;
}

const SeenInfoPopup: React.FC<SeenInfoPopupProps> = ({ reads, setShowPopup}) => {
  return (
    <div className="message-seen-popup"
    onMouseLeave={() => setShowPopup(false)}>
      <strong>Vu par :</strong>
      <ul>
        {reads.map(r => (
          <li key={r.user_id}>
            {r.username} à {new Date(r.read_at).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeenInfoPopup;
