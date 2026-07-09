import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../features/message.api";
import { setArtifacts, setMessages } from "../redux/message.slice";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--accent-teal)]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function GeneratingIndicator() {
  return (
    <div
      className="flex items-start gap-3 w-full max-w-full sm:max-w-[92%] md:max-w-[80%] py-1"
      role="status"
      aria-live="polite"
      aria-label="AKX AI is thinking"
    >
      <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0">
        <span className="text-xs font-bold accent-gradient-text">AI</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl rounded-bl-md bg-[var(--bg-secondary)] border border-[var(--border)]">
        <TypingDots />
        <span className="text-[13px] text-muted">AKX AI is thinking...</span>
      </div>
    </div>
  );
}

export default function MessageList() {
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const { messages, isLoading } = useSelector((state) => state.message);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [messages.length, isLoading]);

  useEffect(() => {
    const convId = selectedConversation?._id;
    if (!convId) {
      dispatch(setMessages([]));
      return;
    }

    if (isLoading) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const data = await getMessages(convId);
        if (cancelled) return;

        dispatch(setMessages(Array.isArray(data) ? data : []));

        const latestArtifactMessage = [...(Array.isArray(data) ? data : [])]
          .reverse()
          .find((msg) => msg.artifacts?.length > 0);

        if (latestArtifactMessage) {
          dispatch(setArtifacts(latestArtifactMessage.artifacts));
        }
      } catch (error) {
        if (!cancelled) console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedConversation?._id, dispatch]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden chat-scroll px-3 sm:px-4 md:px-6 py-4 sm:py-6"
    >
      <div className="mx-auto w-full max-w-3xl space-y-3 sm:space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="min-h-[45vh] sm:min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-2">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg sm:text-xl font-semibold accent-gradient-text tracking-tight">
                AKX AI
              </h1>
              <h3 className="text-sm sm:text-base font-medium text-muted">
                How can I help you?
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-[280px] leading-relaxed mx-auto">
                Ask me anything — code, ideas, explanations, or just say hi.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={msg._id || `${msg.role}-${msg.content?.slice(0, 20)}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full min-w-0"
              >
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  images={msg?.images || []}
                  isError={msg.isError}
                />
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <GeneratingIndicator />
              </motion.div>
            )}
          </>
        )}
        <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
