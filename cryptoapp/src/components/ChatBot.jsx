import { useState } from "react";
import { X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { SiWechat } from "react-icons/si";
import { chatBot } from "../api/chat";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatBot(input)
      const botMessage = { sender: "bot", text: response?.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Xin lỗi, có lỗi xảy ra!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bottom-4 right-4 flex gap-4 items-end">
      {open && (
        <div className="w-80 bg-gray-900 text-white shadow-lg rounded-2xl p-2 pb-0">
          <div className="flex justify-between items-center p-2 border-b border-gray-700">
            <h2 className="text-lg font-semibold">ChatBot</h2>
            <button className="p-2" onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto flex flex-col gap-2 p-2 custom-scroll">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm max-w-[80%] break-words whitespace-pre-wrap ${
                  msg.sender === "bot" ? "bg-blue-600 self-start" : "bg-gray-700 self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-gray-400 text-sm">Đang nhập...</div>}
          </div>
          <div className="p-2 border-t border-gray-700 flex items-center">
            <input
              type="text"
              className="flex-1 bg-gray-800 text-white p-2 rounded-lg outline-none"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="p-2" onClick={sendMessage} disabled={loading}>
              <IoIosSend className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-3 shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <SiWechat className="w-6 h-6" />
      </button>
    </div>
  );
}