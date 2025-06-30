import React, { useEffect, useState } from "react";
import "./create-conversation.css";
import { Contact } from "../../../types/contact";
import ContactCard from "./concact-card/contact-card";
import { fetchMyContacts } from "../../../api/users";
import { useSocket } from "../../../context/socket-context";
import Cookies from "js-cookie";
import { createConversation } from "../../../api/conversations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateConversationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [conversationName, setConversationName] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket();

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const myUserId = parseInt(Cookies.get('userId') || "0", 10);
        const apiResponse = await fetchMyContacts();

        const filteredContacts = apiResponse
          .filter((user: any) => user.user_id !== myUserId)
          .map((user: any) => ({
            id: user.user_id,
            name: user.username,
            email: user.email,
            avatar: user.avatar_url || `https://i.pravatar.cc/40?u=${user.user_id}`,
          }));

        setContacts(filteredContacts);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue lors du chargement des contacts");
      }
    };

    if (isOpen) {
      loadContacts();
    }
  }, [socket, isOpen]);

  const handleCreateConversation = async () => {

    if (selectedContacts.length === 0) {
      setError("Sélectionnez au moins un contact.");
      return;
    }
    setError(null); // reset erreur

    try {
      const newConversation = await createConversation(conversationName, selectedContacts);
      console.log("Conversation créée:", newConversation);
      onClose(); // fermer la modale après création réussie
      // Réinitialiser états si besoin
      setConversationName("");
      setSelectedContacts([]);
    } catch (error: any) {
      setError(error.message || "Erreur lors de la création de la conversation.");
    }
  };


  const toggleContact = (id: number) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Créer une conversation</h2>
        <input
          type="text"
          placeholder="Entrez le nom de la conversation"
          value={conversationName}
          onChange={(e) => setConversationName(e.target.value)}
          className="conversation-input"
        />

        {error && <div className="error-message">{error}</div>}

        <div className="contact-list">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isSelected={selectedContacts.includes(contact.id)}
              onToggle={toggleContact}
            />
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Annuler</button>
        <button
          onClick={handleCreateConversation}>
          Créer
        </button>
        </div>
      </div>
    </div>
  );
};

export default CreateConversationModal;
