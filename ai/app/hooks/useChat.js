import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export function useChat() {
  const [state, setState] = useState({
    messages: [],
    isLoading: false,
    error: null,
    isStreaming: false,
  });

  const abortControllerRef = useRef(null);

  const addMessage = useCallback((message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback((content, isStreaming = false) => {
    setState((prev) => {
      const messages = [...prev.messages];
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant"
      ) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
          isStreaming,
        };
      }
      return { ...prev, messages };
    });
  }, []);

  const setLoading = useCallback((isLoading) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setStreaming = useCallback((isStreaming) => {
    setState((prev) => ({ ...prev, isStreaming }));
  }, []);

  const abortGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
      setLoading(false);

      setState((prev) => {
        const messages = [...prev.messages];
        if (messages.length > 0 && messages[messages.length - 1].isStreaming) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content:
              messages[messages.length - 1].content + " [Generation aborted]",
            isStreaming: false,
          };
        }
        return { ...prev, messages };
      });
    }
  }, [setStreaming, setLoading]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({
      messages: [],
      isLoading: false,
      error: null,
      isStreaming: false,
    });
  }, []);

  return {
    state,
    addMessage,
    updateLastMessage,
    setLoading,
    setError,
    setStreaming,
    abortGeneration,
    clearError,
    resetChat,
    abortControllerRef,
  };
}
