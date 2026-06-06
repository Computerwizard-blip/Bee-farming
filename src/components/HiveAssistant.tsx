/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, Bot, User, CornerDownLeft, Volume2, MoonStar } from "lucide-react";
import { ChatMessage } from "../types";

export function HiveAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "Greetings, friend! I'm Barnaby, your Master Beekeeping Advisor. How are your hives doing today? Ask me anything about honey yields, swarm split operations, queen safety, or winterizing boxes!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(({ sender, text }) => ({ sender, text }));
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to get chat advice");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "assistant",
          text: "I experienced a brief pollen clog in my antenna circuitry. Please let me try that again! Check your internet or make sure your server is completely active.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-yellow-50/50 border border-amber-200/60 rounded-2xl overflow-hidden shadow-sm" id="hive-assistant">
      {/* Bot Chat Header */}
      <div className="flex items-center justify-between bg-amber-500 py-3.5 px-4 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-yellow-100 rounded-lg text-amber-700">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Barnaby the Apiary Expert</h3>
            <p className="text-xs text-amber-100">AI Beekeeping Advisor • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-100 bg-amber-600/40 px-2 py-1 rounded-full">
          <MoonStar className="w-3 h-3 text-amber-200" />
          <span>Organic Advisor</span>
        </div>
      </div>

      {/* Message Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.sender !== "user" && (
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                <Bot className="w-4 h-4 text-amber-700" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                m.sender === "user"
                  ? "bg-amber-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-amber-100"
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
              <p
                className={`text-[10px] mt-1 text-right ${
                  m.sender === "user" ? "text-amber-200" : "text-gray-400"
                }`}
              >
                {m.timestamp}
              </p>
            </div>
            {m.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center shrink-0 text-white">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 animate-spin">
              <Loader2 className="w-4 h-4 text-amber-700" />
            </div>
            <div className="bg-white border border-amber-100 text-gray-400 text-xs px-3.5 py-2.5 rounded-2xl rounded-bl-none italic">
              Barnaby is sketching ideas on his hive logs...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-amber-100 flex gap-2 items-center">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Barnaby about hive temperatures, mites, or honey rules..."
          className="flex-1 bg-amber-50/20 text-sm border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-amber-700/40 text-gray-850"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl transition duration-150 shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
