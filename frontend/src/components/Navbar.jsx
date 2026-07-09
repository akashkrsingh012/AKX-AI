import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";

export default function Navbar() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-5 pl-14 lg:pl-5 border-b border-app bg-app">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
          <MessageSquare size={13} className="text-indigo-400" />
        </div>
        <h2 className="text-[13px] sm:text-[14px] font-semibold tracking-tight truncate text-app">
          {selectedConversation?.title || "New Chat"}
        </h2>
        <span className="hidden sm:inline shrink-0 text-[10px] font-medium text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div>
    </header>
  );
}
