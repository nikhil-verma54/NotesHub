import { useState, useRef, useEffect } from "react";
import axios from "../components/AxiosInstance";

function Chatbot({ open, setOpen }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { user: "", bot: "Hi 👋, I am Genie — your study buddy! Ask me anything about NotesHub 📚" },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { user: input, bot: "" };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("/api/chat/", {
        message: userMsg.user,
      });

      const data = await res.data;

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const botText =
          data.reply
            ? data.reply
            : data.error || "Something went wrong. Please try again.";
        updated[lastIndex] = { ...updated[lastIndex], bot: botText };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          bot: `Error: ${err.message}`,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "350px",
        height: "450px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#4f46e5",
          color: "white",
          padding: "12px",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Genie 🤖
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          overflowX: "hidden",
          fontSize: "14px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {m.user && (
              <p>
                <b>You:</b> {m.user}
              </p>
            )}
            {m.bot && (
              <p
                style={{
                  background: "#f3f4f6",
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <b>Bot:</b> {m.bot}
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ddd",
          padding: "8px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "8px",
            marginRight: "5px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: loading ? "#818cf8" : "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
