import React, { useState } from "react";
import { createUserMessage } from "../../api/UserMessageController";

interface UserMessageCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    senderNumber: string;
    recipientNumber: string;
    messageContent: string;
  }) => void;
}

const UserMessageCreateModal: React.FC<UserMessageCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [senderNumber, setSenderNumber] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const handleNumberChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    // Only allow digits
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setter(numbersOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the POST endpoint
      await createUserMessage({
        senderNumber: Number(senderNumber),
        recipientNumber: Number(recipientNumber),
        messageContent,
      });

      onSubmit({ senderNumber, recipientNumber, messageContent });

      setSenderNumber("");
      setRecipientNumber("");
      setMessageContent("");
      onClose();
    } catch (error) {
      console.log("Error creating message:", error);
    } finally {
      console.log("Message creation completed successfully.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "lightgray",
          padding: "2rem",
          borderRadius: "8px",
          width: "400px",
          color: "black",
        }}
      >
        <h3 style={{ color: "black" }}>Create Message</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "black" }}>From:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={senderNumber}
              onChange={(e) =>
                handleNumberChange(e.target.value, setSenderNumber)
              }
              placeholder="Enter numbers only"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                color: "black",
                backgroundColor: "white",
              }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "black" }}>To:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={recipientNumber}
              onChange={(e) =>
                handleNumberChange(e.target.value, setRecipientNumber)
              }
              placeholder="Enter numbers only"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                color: "black",
                backgroundColor: "white",
              }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "black" }}>Message:</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Enter your message"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.25rem",
                height: "80px",
                color: "black",
                backgroundColor: "white",
              }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ color: "black", backgroundColor: "white" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ color: "black", backgroundColor: "white" }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserMessageCreateModal;
