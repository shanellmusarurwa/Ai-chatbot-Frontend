"use client";

import React from "react";

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="flex justify-center">
      <div className="relative p-4 border bg-red-500/30 backdrop-blur-sm border-red-500/50 rounded-2xl">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
        >
          ✕
        </button>
        <p className="text-sm text-white">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
