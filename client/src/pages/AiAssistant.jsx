import { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AiAssistant() {
  const { primaryColor } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hello! I am your AI assistant. How can I help you manage your orders today?" }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Try OpenRouter streaming via server proxy; fallback to local Ollama if proxy fails
    (async () => {
      const token = localStorage.getItem("token");
      const baseMessages = [...messages.map(m => ({ role: m.role, content: m.text })), { role: "user", content: userMsg.text }];
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/ai/groq-chat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            messages: baseMessages,
            model: "google/gemini-2.0-flash-001",
            temperature: 0.7,
            max_completion_tokens: 4096,
            top_p: 1,
            stream: true
          })
        });
        
        if (!res.ok) {
           const errText = await res.text();
           throw new Error(errText || "OpenRouter proxy failed");
        }
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantId = Date.now() + 1;
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", text: "" }]);
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const json = line.slice(5).trim();
            if (json === "[DONE]") continue;
            try {
              const payload = JSON.parse(json);
              const delta = payload?.choices?.[0]?.delta?.content || "";
              if (delta) {
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: m.text + delta } : m));
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch {
        try {
          const res = await fetch((import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434") + "/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b",
              messages: baseMessages,
              stream: false
            })
          });
          const data = await res.json();
          const content = data?.message?.content || "No response";
          const aiMsg = { id: Date.now() + 1, role: "assistant", text: content };
          setMessages(prev => [...prev, aiMsg]);
        } catch {
          const aiMsg = { id: Date.now() + 1, role: "assistant", text: "AI service unavailable. Please configure OPENROUTER_API_KEY in server." };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    })();
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-yellow-500" /> AI Assistant
        </h1>
        <p className="text-gray-500">Ask questions about your orders, customers, or analytics.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'assistant' ? 'bg-white text-blue-600' : 'text-white'
                }`}
                style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
              >
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              
              <div 
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                }`}
                style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <span className={`text-xs mt-2 block opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ '--tw-ring-color': primaryColor }}
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-2 p-2 rounded-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
