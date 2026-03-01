/**
 * Format a timestamp to a readable time string
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string (e.g., "10:30 AM")
 */
export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Extract code blocks from markdown text
 * @param {string} text - Markdown text
 * @returns {Array} Array of code blocks with language and content
 */
export const extractCodeBlocks = (text) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || "text",
      content: match[2].trim(),
      fullMatch: match[0],
    });
  }

  return blocks;
};

/**
 * Sanitize user input for safe display
 * @param {string} text - User input text
 * @returns {string} Sanitized text
 */
export const sanitizeInput = (text) => {
  if (!text) return "";
  // Basic sanitization - remove any potentially harmful characters
  return text
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .trim();
};

/**
 * Format agent response for display
 * @param {string} response - Raw agent response
 * @returns {string} Formatted response
 */
export const formatAgentResponse = (response) => {
  if (!response) return "";

  // Ensure proper line breaks
  let formatted = response.replace(/\\n/g, "\n");

  // Ensure code blocks are properly formatted
  formatted = formatted.replace(/```(\w+)?\n?/g, (match, lang) => {
    return lang ? `\`\`\`${lang}\n` : "```\n";
  });

  return formatted;
};

/**
 * Calculate reading time for a message
 * @param {string} text - Message text
 * @returns {number} Reading time in seconds
 */
export const calculateReadingTime = (text) => {
  if (!text) return 0;
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes * 60); // Return seconds
};

/**
 * Generate a preview of the conversation for sharing
 * @param {Array} messages - Array of message objects
 * @param {number} maxLength - Maximum length of preview
 * @returns {string} Conversation preview
 */
export const generateConversationPreview = (messages, maxLength = 200) => {
  if (!messages || messages.length === 0) return "No messages";

  const lastMessages = messages.slice(-3); // Get last 3 messages
  const preview = lastMessages
    .map(
      (msg) =>
        `${msg.role === "user" ? "👤" : "🤖"}: ${truncateText(msg.content, 50)}`,
    )
    .join(" | ");

  return truncateText(preview, maxLength);
};

/**
 * Check if a message contains code
 * @param {string} text - Message text
 * @returns {boolean} True if message contains code
 */
export const containsCode = (text) => {
  if (!text) return false;

  // Check for code blocks
  const codeBlockRegex = /```[\s\S]*?```/;
  if (codeBlockRegex.test(text)) return true;

  // Check for inline code
  const inlineCodeRegex = /`[^`]+`/;
  if (inlineCodeRegex.test(text)) return true;

  // Check for common code patterns
  const codePatterns = [
    /function\s+\w+\s*\(/, // JavaScript function
    /const\s+\w+\s*=/, // JavaScript const
    /let\s+\w+\s*=/, // JavaScript let
    /if\s*\(.*\)\s*{/, // if statement
    /for\s*\(.*\)\s*{/, // for loop
    /while\s*\(.*\)\s*{/, // while loop
    /import\s+.*\s+from/, // import statement
    /export\s+default/, // export statement
    /class\s+\w+/, // class definition
    /def\s+\w+\s*\(/, // Python function
    /print\s*\(/, // Python print
    /console\.log/, // console.log
    /<\/?\w+>/, // HTML tags
  ];

  return codePatterns.some((pattern) => pattern.test(text));
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate a unique ID for messages
 * @returns {string} Unique ID
 */
export const generateMessageId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Group messages by date for display
 * @param {Array} messages - Array of message objects
 * @returns {Object} Messages grouped by date
 */
export const groupMessagesByDate = (messages) => {
  return messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
};

/**
 * Format date for message groups
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatMessageDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }
};
