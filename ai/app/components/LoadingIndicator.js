"use client";

import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="mr-3 avatar">⚡</div>
      <div className="message-bubble-ai">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
