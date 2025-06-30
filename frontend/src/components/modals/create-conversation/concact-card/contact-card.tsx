import React from "react";
import "./contact-card.css";
import { Contact } from "../../../../types/contact";

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, isSelected, onToggle }) => {
  return (
    <div className="contact-card">
      <img src={contact.avatar} alt="avatar" className="contact-avatar" />
      <div className="contact-info">
        <strong>{contact.name}</strong>
        <em>{contact.email}</em>
      </div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(contact.id)}
        className="contact-checkbox"
      />
    </div>
  );
};

export default ContactCard;
