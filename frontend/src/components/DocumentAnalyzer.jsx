import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import api from "../utils/axios";

export default function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "text/plain",
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMsg("Unsupported file type. Please upload PDF, DOCX, TXT, or Image.");
      setStatus("error");
      return false;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 20MB.");
      setStatus("error");
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      resetState();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      resetState();
    }
  };

  const resetState = () => {
    setStatus("idle");
    setErrorMsg("");
    setResult(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      setErrorMsg("");
      setUploadProgress(10); // Start progress

      const response = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 90) / progressEvent.total
          ); // Leave 10% for processing
          setUploadProgress(percentCompleted);
        },
      });

      setUploadProgress(100);
      setStatus("success");
      setResult(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("error");
      setErrorMsg(
        err.response?.data?.message || "An error occurred during file upload and processing."
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-app overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Document Analyzer</h1>
          <p className="text-slate-400">
            Upload a PDF, Word document, Image, or Text file. We will extract the text and ask AI to analyze it.
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-white/10 bg-surface hover:border-white/20 hover:bg-white/[0.02]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.txt,image/png,image/jpeg,image/jpg,image/webp"
          />

          {!file ? (
            <>
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">
                Drag and drop your file here
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Supports PDF, DOCX, TXT, PNG, JPG, WEBP (Max 20MB)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer border-none"
              >
                Browse Files
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center w-full max-w-md">
              <div className="flex items-center gap-4 w-full p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {status !== "uploading" && (
                  <button
                    onClick={() => {
                      setFile(null);
                      resetState();
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  </button>
                )}
              </div>

              {status === "idle" && (
                <button
                  onClick={handleUpload}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-[0_2px_12px_rgba(99,91,255,0.35)] cursor-pointer border-none"
                >
                  Analyze Document
                </button>
              )}

              {status === "uploading" && (
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </span>
                    <span className="text-slate-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="w-full flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl mt-4 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              {status === "success" && (
                <div className="w-full flex items-center gap-3 text-green-400 bg-green-500/10 border border-green-500/20 p-4 rounded-xl mt-4">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">Analysis complete!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            <div className="bg-surface border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  ✨
                </span>
                AI Analysis
              </h3>
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {result.aiResponse}
              </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                Extracted Text (Preview)
              </h3>
              <div className="bg-[#0d0f14] border border-white/5 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-[11px] sm:text-xs text-slate-400 whitespace-pre-wrap">
                {result.extractedText}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
