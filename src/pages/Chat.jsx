import { useState, useRef, useEffect } from "react";
import {useNavigate} from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const chatRef = useRef(null);

  const [typingIndex, setTypingIndex] = useState(0);

  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "User";

  const userInitial = userEmail.charAt(0).toUpperCase();

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() =>{
    setMessages([
      {
        text: "Hi 👋 I'm your AI Coding Assistant.\nAsk me anything about programming, projects, or concepts!",
        sender: "bot",
      },
  ]);
  }, []);

  // 🎤 Speech Recognition
  const handleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  // 🚀 Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userId = localStorage.getItem("userId");

    const newMessages = [
      ...messages,
      { text: userText, sender: "user" },
    ];

    setMessages(newMessages);
    setInput("");

    // Show typing
    setMessages((prev) => [
      ...prev,
      { text: "Typing...", sender: "bot" },
    ]);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: newMessages,
          userId, // 🧠 send chat history
        }),
      });

      const data = await res.json();
      const reply = data.reply || "No response from AI";

      // Replace "Typing..." with real response
      let i = 0;
      const fullText = reply;
      const typingInterval = setInterval(() => {
        i++;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            text: fullText.slice(0, i),
            sender: "bot",
          };
          return updated;
        });
        if (i >= fullText.length) {
          clearInterval(typingInterval);
        }
      }, 15);

    }
    catch (error) {
      console.error(error);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          text: "Error connecting to AI",
          sender: "bot",
        };
        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#140d2b] via-[#1e133d] to-[#0a061a] text-white">

      {/* Header */}
      <div className="p-4 border-b border-purple-700 flex justify-between items-center">

        <h1 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
          AI Coding Assistant
        </h1>

        {/* User Icon */}
        <div className="relative flex items-center gap-3">

          <button 
            onClick={() => setMessages([])}
            className= "text-xs text-gray-400 hover:text-red-400"
          >
            <span className="text-sm text-gray-300">Clear</span>
          </button>

          <span className="text-sm text-gray-300">User</span>

          <div
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center cursor-pointer hover:scale-105 transition"
          >
            {userInitial}
          </div>

          {showMenu && (
            <div className="absolute right-0 top-12 bg-[#2a1f4a] p-3 rounded-lg shadow-lg w-32">
              <button
                onClick={() => {
                  localStorage.removeItem("userId");
                  navigate("/login");
                }}
                className="w-full text-left text-sm hover:text-red-400"
              >
                Logout
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-auto px-4 py-6 flex flex-col items-center">

        <div className="max-w-4xl w-full">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-full flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`px-4 py-3 my-2 rounded-2xl max-w-[700px] break-words ${msg.sender === "user"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "bg-[#2a1f4a] text-gray-200"
                  } shadow-md`}
              >
                {msg.text.includes("```") ? (
                  <div className="relative">
                    <button onClick={() =>
                      navigator.clipboard.writeText(msg.text.replace(/```/g, ""))
                    }
                      className="absolute top-2 right-2 text-xs bg-purple-600 px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Copy
                    </button>
                    <pre className="bg-black/60 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border border-purple-500/20">
                      <code>{msg.text.replace(/```/g, "")}</code>
                    </pre>
                  </div>
                ) : (
                  msg.text.split("\n").map((line, i) => (
                    <p key={i} className="leading-relaxed mb-1">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div ref={chatRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-4 flex gap-3 border-t border-purple-700">

        <input
          type="text"
          placeholder={isListening ? "Listening..." : "Ask me anything about coding, DSA, or concepts..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-3 rounded-full bg-white/10 text-white outline-none placeholder-gray-300 focus:ring-2 focus:ring-purple-500"
        />

        {/* 🎤 Mic Button */}
        <button
          onClick={handleMic}
          className={`px-4 rounded-full ${isListening
            ? "bg-red-500"
            : "bg-gradient-to-r from-purple-600 to-indigo-600"
            }`}
        >
          🎤
        </button>

        {/* Send Button */}
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 rounded-full hover:scale-105 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;