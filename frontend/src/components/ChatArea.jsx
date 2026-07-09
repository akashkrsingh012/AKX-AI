import { useState, useEffect } from "react";
import AIBanner from "./AiBanner";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Navbar from "./Navbar";
import api from "../utils/axios";

function ChatArea() {
  const [banner, setBanner] = useState({
    open: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/api/agent/health/ai");
        if (cancelled || data?.configured) return;

        setBanner({
          open: true,
          title: "AI Not Configured",
          message:
            "Add OPENAI_API_KEY in backend/services/agent/.env, then restart with npm run dev.",
        });
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      <Navbar />

      <MessageList />

      <AIBanner
        open={banner.open}
        title={banner.title}
        message={banner.message}
        onClose={() => setBanner({ ...banner, open: false })}
      />

      <ChatInput setBanner={setBanner} />
    </div>
  );
}

export default ChatArea;
