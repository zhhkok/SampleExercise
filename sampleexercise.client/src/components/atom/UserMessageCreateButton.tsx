import React from "react";

interface UserMessageCreateButtonProps {
  onClick: () => void;
}

const UserMessageCreateButton: React.FC<UserMessageCreateButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.75rem 1rem",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Create Message
    </button>
  );
};

export default UserMessageCreateButton;
