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

    try {
      abortControllerRef.current = new AbortController();

      const useStreaming =
        process.env.NEXT_PUBLIC_AGENT_URL?.includes("stream");

      if (useStreaming) {
        await handleStreamingResponse(userMessage.content);
      } else {
        await handleStandardResponse(userMessage.content);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error sending message:", error);
        setError("Failed to get response. Please try again.");
        updateLastMessage(
          "Sorry, I encountered an error. Please try again.",
          false,
        );
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStreamingResponse = async (userMessage) => {
    setStreaming(true);

    const response = await fetch(process.env.NEXT_PUBLIC_AGENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userMessage }),
      signal: abortControllerRef.current?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
            const data = JSON.parse(line.slice(5));
            if (data.content) {
              accumulatedContent += data.content;
              updateLastMessage(accumulatedContent, true);
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    }

    updateLastMessage(accumulatedContent, false);
  };

  const handleStandardResponse = async (userMessage) => {
    const response = await fetch(process.env.NEXT_PUBLIC_AGENT_INVOKE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: userMessage }),
      signal: abortControllerRef.current?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    updateLastMessage(data.output || "No response from agent", false);
  };

  return (
    <div className="liquid-glass-container">
      {/* Centered Header - exactly like image 2 */}
      <div className="centered-header">
        <h1>Hi, I&apos;m Micci.</h1>
        <p>How can I help you today?</p>
      </div>

      {/* Input Area */}
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

        {/* Button Row - Deep Search and Search buttons side by side */}
        <div className="button-row">
          <button
            type="button"
            className="deep-search-button"
            onClick={() => setShowDeepSearch(!showDeepSearch)}
          >
            <span>Deep search</span>
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

      {/* Deep Search Options - with proper spacing to avoid overlap */}
      {showDeepSearch && (
        <div className="mt-6 mb-2">
          <div className="message-bubble">
            <div className="text-sm message-content text-white/80">
              Deep search options would appear here
            </div>
          </div>
        </div>
      )}

      {/* Messages Container - below input, centered */}
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
                {new Date(message.timestamp).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
              <div className="message-content">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-flex ml-2">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse animation-delay-200">.</span>
                    <span className="animate-pulse animation-delay-400">.</span>
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {state.isLoading && !state.isStreaming && (
            <div className="message-bubble assistant-message">
              <div className="message-content">
                Thinking
                <span className="inline-flex ml-2">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse animation-delay-200">.</span>
                  <span className="animate-pulse animation-delay-400">.</span>
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {state.error && (
            <div className="error-message">
              <button
                onClick={clearError}
                className="absolute top-2 right-2 text-white/50 hover:text-white"
              >
                ✕
              </button>
              <div className="text-sm message-content">{state.error}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Abort button when streaming */}
      {state.isStreaming && (
        <button
          onClick={abortGeneration}
          className="w-full mt-6 text-center pill-button"
        >
          Stop Generating
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
