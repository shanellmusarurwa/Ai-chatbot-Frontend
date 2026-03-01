"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  return (
    <div
      className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <div className="flex-shrink-0 mr-3 avatar">⚡</div>}

      <div
        className={clsx(isUser ? "message-bubble-user" : "message-bubble-ai")}
      >
        <div className="mb-1 text-xs opacity-70">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </div>

        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {isStreaming && (
          <div className="flex items-center mt-2 space-x-1">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce animation-delay-400"></div>
          </div>
        )}
      </div>

      {isUser && <div className="flex-shrink-0 ml-3 avatar">👤</div>}
    </div>
  );
};

export default MessageBubble;
