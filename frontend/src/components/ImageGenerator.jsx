import { useState, useEffect } from "react";
import { Download, Loader2, Image as ImageIcon, Send } from "lucide-react";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

function buildImageUrl(prompt, seed) {
  const params = new URLSearchParams({
    seed: String(seed),
    width: "1024",
    height: "1024",
    nologo: "true",
    enhance: "true",
  });
  return `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}?${params.toString()}`;
}

async function fetchImageBlob(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image request failed (${response.status})`);
  }
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("Invalid image response");
  }
  return blob;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("imageHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem("imageHistory", JSON.stringify(newHistory));
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;

    setIsGenerating(true);
    setError("");
    setCurrentImage(null);

    const seeds = [
      Math.floor(Math.random() * 1_000_000),
      Math.floor(Math.random() * 1_000_000),
      Math.floor(Math.random() * 1_000_000),
    ];

    try {
      let blobUrl = null;

      for (const seed of seeds) {
        try {
          const imageUrl = buildImageUrl(trimmed, seed);
          const blob = await fetchImageBlob(imageUrl);
          blobUrl = URL.createObjectURL(blob);
          break;
        } catch (attemptError) {
          console.warn("Image generation attempt failed:", attemptError.message);
        }
      }

      if (!blobUrl) {
        throw new Error("Could not generate image. Please try again.");
      }

      setCurrentImage(blobUrl);
      if (!history.includes(blobUrl)) {
        saveHistory([blobUrl, ...history].slice(0, 20));
      }
    } catch (generateError) {
      setError(generateError.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      console.error("Download failed:", downloadError);
      alert("Failed to download image.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f14] overflow-hidden">
      <div className="flex-none px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Image Generator</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          <div className="w-full aspect-square md:aspect-video bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-center justify-center overflow-hidden relative">
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={prompt}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => downloadImage(currentImage)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
                >
                  <Download size={16} />
                  <span className="text-xs font-semibold pr-1">Download</span>
                </button>
              </>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="text-sm font-medium text-slate-200">Generating your image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-4 p-8 text-center">
                <ImageIcon size={48} className="opacity-50" />
                <p className="text-sm max-w-md">
                  Enter a descriptive prompt below to generate an image. Be as specific as you like!
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="w-full text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleGenerate} className="w-full relative group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl pl-5 pr-14 py-4 text-[15px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-xl transition-colors"
            >
              <Send size={16} className={prompt.trim() && !isGenerating ? "" : "opacity-50"} />
            </button>
          </form>

          {history.length > 0 && (
            <div className="w-full mt-8">
              <h3 className="text-sm font-medium text-slate-400 mb-4 px-1">Recent Generations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.05]"
                  >
                    <img src={url} alt="History" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => downloadImage(url)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
