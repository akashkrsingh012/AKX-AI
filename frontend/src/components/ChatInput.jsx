import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Paperclip,
  Square,
  Zap,
  MessageSquare,
  Code2,
  Presentation,
  Image as ImageIcon,
  Globe,
  FileText,
  X,
  Mic,
  MicOff,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setIsLoading } from "../redux/message.slice";
import { sendPrompt } from "../features/agent.api";
import { createConversation, updateConversations } from "../features/conversation.api";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversation.slice";

const basePlaceholders = {
  auto: "Ask AKX AI...",
  chat: "Chat with AKX AI...",
  coding: "Describe the software you want...",
  pdf: "Generate a PDF about...",
  ppt: "Create a presentation about...",
  image: "Describe the image...",
  search: "Search the web...",
};

const agents = [
  { id: "auto", icon: Zap, label: "Auto" },
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "coding", icon: Code2, label: "Coding" },
  { id: "pdf", icon: FileText, label: "PDF" },
  { id: "ppt", icon: Presentation, label: "PPT" },
  { id: "image", icon: ImageIcon, label: "Image" },
  { id: "search", icon: Globe, label: "Search" },
];

export default function ChatInput({ setBanner }) {
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const sendingRef = useRef(false);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { isLoading } = useSelector((state) => state.message);

  const placeholder =
    selectedAgent === "image" && selectedFile?.type?.startsWith("image/")
      ? "Ask about this image..."
      : basePlaceholders[selectedAgent];

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setValue(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = useCallback(async () => {
    const prompt = value.trim();
    if (!prompt || isLoading || sendingRef.current) return;

    sendingRef.current = true;
    dispatch(setIsLoading(true));

    try {
      let conversation = selectedConversation;

      if (!conversation) {
        const newConversation = await createConversation();
        dispatch(addConversation(newConversation));
        dispatch(setSelectedConversation(newConversation));
        conversation = newConversation;
      }

      dispatch(addMessage({ role: "user", content: prompt }));
      setValue("");

      const formData = new FormData();
      formData.append("conversationId", conversation._id);
      formData.append("prompt", prompt);
      formData.append("agent", selectedAgent);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      setSelectedFile(null);

      if (conversation.title === "New Chat") {
        const title = prompt.slice(0, 40);
        await updateConversations(conversation._id, title);
        dispatch(setConvTitle({ conversationId: conversation._id, title }));
      }

      console.log("[AKX AI] Sending message:", prompt);
      const data = await sendPrompt(formData);
      console.log("[AKX AI] Response received:", data);

      const answer = data?.answer || data?.response;
      if (!answer) {
        throw new Error("Empty response from AKX AI");
      }

      dispatch(
        addMessage({
          role: "assistant",
          content: answer,
          images: data.images || [],
        })
      );

      if (data.artifacts?.length) {
        dispatch(setArtifacts(data.artifacts));
      }
    } catch (error) {
      console.error("[AKX AI] Send failed:", error);
      const errData = error.response?.data;

      const errorMessage =
        errData?.message ||
        error.message ||
        "Failed to get a response. Please try again.";

      dispatch(
        addMessage({
          role: "assistant",
          content: `⚠️ **${errData?.title || "Error"}**\n\n${errorMessage}`,
          isError: true,
        })
      );

      setBanner({
        open: true,
        title: errData?.title || "Request failed",
        message: errorMessage,
      });
    } finally {
      dispatch(setIsLoading(false));
      sendingRef.current = false;
    }
  }, [
    value,
    isLoading,
    selectedConversation,
    selectedAgent,
    selectedFile,
    dispatch,
    setBanner,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="shrink-0 w-full overflow-hidden px-2 sm:px-3 md:px-5 py-3 sm:py-4 border-t border-app bg-app">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-2 bg-surface border border-app rounded-xl px-3 sm:px-4 pt-3 pb-2.5 sm:pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = selectedAgent === agent.id;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.id)}
                  aria-pressed={isActive}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium border transition-all ${
                    isActive
                      ? "accent-gradient text-white border-transparent shadow-[0_2px_10px_rgba(99,91,255,0.3)]"
                      : "bg-[var(--bg-elevated)] text-muted border-[var(--border)] hover:bg-[var(--bg-primary)]"
                  }`}
                >
                  <Icon size={14} />
                  <span className="whitespace-nowrap">{agent.label}</span>
                </button>
              );
            })}
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2 rounded-lg border border-app bg-elevated px-3 py-2 max-w-full">
              {selectedFile.type === "application/pdf" ? (
                <FileText size={16} className="text-red-400 shrink-0" />
              ) : selectedFile?.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-xs truncate">{selectedFile.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="shrink-0 p-1"
                aria-label="Remove file"
              >
                <X size={14} className="text-muted" />
              </button>
            </div>
          )}

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            disabled={isLoading}
            aria-label="Message input"
            className="w-full bg-transparent outline-none resize-none text-[13px] sm:text-[14px] text-app placeholder:text-muted leading-relaxed min-h-[2.75rem] max-h-32 disabled:opacity-50"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                hidden
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-app hover:bg-elevated transition-all bg-transparent cursor-pointer"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach file"
              >
                <Paperclip size={14} />
              </button>
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer ${
                  isListening ? "bg-red-500 text-white" : "text-muted hover:bg-elevated"
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !value.trim()}
              aria-label={isLoading ? "Stop generating" : "Send message"}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border-none cursor-pointer transition-all shrink-0 ${
                isLoading
                  ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                  : value.trim()
                    ? "accent-gradient hover:opacity-90 text-white shadow-[0_2px_12px_rgba(99,91,255,0.35)]"
                    : "bg-elevated text-muted cursor-not-allowed"
              }`}
            >
              {isLoading ? <Square size={12} fill="currentColor" /> : <Send size={15} />}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted mt-2 px-2">
          AKX AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
