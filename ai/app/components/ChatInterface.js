"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { v4 as uuidv4 } from "uuid";

const ChatInterface = () => {
  const {
    state,
    addMessage,
    updateLastMessage,
    setLoading,
    setError,
    setStreaming,
    abortGeneration,
    clearError,
    abortControllerRef,
  } = useChat();

  const [inputValue, setInputValue] = useState("");
  const [showDeepSearch, setShowDeepSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");
    setLoading(true);
    clearError();

    const assistantMessageId = uuidv4();
    addMessage({
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    });

    abortControllerRef.current = new AbortController();

    try {
      const useStreaming = false; // true for streaming, false for invoke

      if (useStreaming) {
        await handleStreamingResponse(userMessage.content);
      } else {
        await handleStandardResponse(userMessage.content);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("API failed, using fallback:", error);
        updateLastMessage(
          `This is a fallback mock response. You asked: "${userMessage.content}"`,
          false,
        );
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // ✅ STREAMING HANDLER
  const handleStreamingResponse = async (userMessage) => {
    setStreaming(true);

    const STREAM_URL =
      process.env.NEXT_PUBLIC_AGENT_STREAM_URL ||
      "https://ai4d.wiremockapi.cloud/agent/stream";

    console.log("Streaming URL:", STREAM_URL);

    const response = await fetch(STREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.replace("data: ", "").trim());
            if (json.content) {
              accumulatedContent += json.content;
              updateLastMessage(accumulatedContent, true);
            }
          } catch (err) {
            console.error("Stream parse error:", err);
          }
        }
      }
    }

    updateLastMessage(accumulatedContent, false);
  };

  // ✅ STANDARD INVOKE HANDLER
  const handleStandardResponse = async (userMessage) => {
    const INVOKE_URL =
      process.env.NEXT_PUBLIC_AGENT_INVOKE_URL ||
      "https://ai4d.wiremockapi.cloud/agent/invoke";

    console.log("Invoke URL:", INVOKE_URL);

    const response = await fetch(INVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Invoke response full:", data);

    // Extract AI message safely
    let assistantText = "No response from agent";
    const messages = data.output?.messages;
    if (Array.isArray(messages)) {
      const aiMessage = messages.find((m) => m.type === "ai");
      if (aiMessage) {
        if (typeof aiMessage.content === "string") {
          assistantText = aiMessage.content;
        } else if (typeof aiMessage.content === "object") {
          assistantText =
            aiMessage.content.text ||
            JSON.stringify(aiMessage.content, null, 2);
        }
      }
    }

    updateLastMessage(assistantText, false);
  };

  return (
    <div className="liquid-glass-container">
      <div className="centered-header">
        <h1>Hi, I&apos;m Micci.</h1>
        <p>How can I help you today?</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything..."
            disabled={state.isLoading}
            className="glass-input"
            autoFocus
          />
        </div>

        <div className="button-row">
          <button
            type="button"
            className="deep-search-button"
            onClick={() => setShowDeepSearch(!showDeepSearch)}
          >
            Deep search
          </button>

          <button
            type="submit"
            disabled={state.isLoading || !inputValue.trim()}
            className="pill-button"
          >
            Search
          </button>
        </div>
      </form>

      {showDeepSearch && (
        <div className="mt-6 mb-2">
          <div className="message-bubble">
            <div className="text-sm message-content text-white/80">
              Deep search options would appear here
            </div>
          </div>
        </div>
      )}

      {state.messages.length > 0 && (
        <div className="mt-6 messages-container">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.role === "user" ? "user-message" : "assistant-message"
              }`}
            >
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>

              <div className="message-content">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-flex ml-2">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse">.</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {state.error && (
            <div className="error-message">
              <button onClick={clearError} className="absolute top-2 right-2">
                ✕
              </button>
              <div className="text-sm">{state.error}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {state.isStreaming && (
        <button onClick={abortGeneration} className="w-full mt-6 pill-button">
          Stop Generating
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
