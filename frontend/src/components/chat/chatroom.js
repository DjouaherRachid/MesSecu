import React, { useState, useEffect } from "react";
import socket from "../../api/socket";
import MessageList from "./message_list";
import MessageInput from "./message_input";

/*const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General"); // Salon par défaut
  const [text, setText] = useState("");

  useEffect(() => {
    // Rejoindre le salon lorsque le composant est monté
    socket.emit("joinRoom", room);

    // Écoute des messages du salon
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Nettoyage : quitter le salon lorsque le composant est démonté
    return () => {
      socket.emit("leaveRoom", room);
      socket.off("message");
    };
  }, [room]); // Re-écoute chaque fois que le salon change

  const handleSendMessage = () => {
    const message = { sender: "You", text };
    socket.emit("sendMessage", message, room); // Envoi du message dans le salon actuel
    setMessages((prev) => [...prev, message]);
    setText(""); // Réinitialisation du champ de texte
  };

  const handleRoomChange = (newRoom) => {
    setRoom(newRoom); // Change le salon et réinitialise les messages
    setMessages([]); // Réinitialise les messages lors du changement de salon
  };

  return (
    <div>
      <div>
        <button onClick={() => handleRoomChange("General")}>Salon Général</button>
        <button onClick={() => handleRoomChange("Sports")}>Salon Sports</button>
        <button onClick={() => handleRoomChange("Tech")}>Salon Tech</button>
      </div>
      <MessageList messages={messages} />
      <MessageInput text={text} setText={setText} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatRoom;*/

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    { sender: "Alice", text: "test les gars ?" },
    { sender: "Bob", text: "Oui et toi ?" },
    { sender: "You", text: "Super, merci !" },
    { sender: "Alice", text: "On se voit demain ?" },
    { sender: "You", text: "Bien sûr, à 14h ?" },
  ]);

  return (
    <div>
      <MessageList messages={messages} />

      {/* Temporaire : boîte de saisie désactivée */}
      <div style={{ display: "flex", padding: "10px", background: "#f4f4f4" }}>
        <input
          type="text"
          placeholder="Formulaire en développement..."
          style={{ flex: 1, padding: "10px", borderRadius: "20px" }}
          disabled
        />
        <button disabled style={{ marginLeft: "10px", padding: "10px 20px" }}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;