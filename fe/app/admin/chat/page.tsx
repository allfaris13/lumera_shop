"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";

export default function AdminChatPage() {
  const [messages, setMessages] = useState([
    { sender: "customer", text: "Halo admin, saya mau tanya produk!" },
    { sender: "admin", text: "Halo! Silakan, ada yang bisa dibantu?" },
  ]);
  const [input, setInput] = useState("");

  // Fungsi tanpa parameter 'e' agar lolos build
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "admin", text: input }]);
    setInput("");
  };

  // Menangani input text secara eksplisit
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // Menangani tekan tombol Enter
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-md text-black">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] ${
                msg.sender === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t flex items-center px-4 py-3 bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
          className="flex-1 px-3 py-2 border rounded-lg outline-none bg-white text-black"
        />
        <button
          type="button"
          onClick={handleSend}
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}