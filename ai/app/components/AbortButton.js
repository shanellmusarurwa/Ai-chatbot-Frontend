"use client";

import React from "react";

const AbortButton = ({ onAbort }) => {
  return (
    <button
      onClick={onAbort}
      className="absolute flex items-center px-4 py-2 space-x-2 text-white transition-all rounded-lg -top-12 right-4 glass-button-deep hover:scale-105"
      aria-label="Stop generating"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span>Stop</span>
    </button>
  );
};

export default AbortButton;
