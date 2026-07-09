import fs from "fs/promises";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { callOpenRouter } from "../utils/openrouter.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const processUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const { path: filePath, mimetype, originalname } = req.file;
  let extractedText = "";
  let fileType = "";

  try {
    if (mimetype === "application/pdf") {
      fileType = "pdf";
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      fileType = "docx";
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (mimetype === "text/plain") {
      fileType = "txt";
      extractedText = await fs.readFile(filePath, "utf8");
    } else if (mimetype.startsWith("image/")) {
      fileType = "image";
      const result = await Tesseract.recognize(filePath, "eng");
      extractedText = result.data.text;
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }

    // Clean whitespace
    extractedText = (extractedText || "").replace(/\s+/g, " ").trim();

    if (!extractedText) {
      return res.status(400).json({ success: false, message: "Could not extract any text from the file." });
    }

    const prompt = `Please analyze the following extracted text from an uploaded file (${originalname}):\n\n${extractedText}`;
    const aiResponse = await callOpenRouter(prompt);

    res.json({
      success: true,
      fileType,
      extractedText,
      aiResponse,
    });
  } catch (error) {
    console.error("[Upload] Error processing file:", error);
    res.status(500).json({ success: false, message: "Error processing file: " + error.message });
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.error("[Upload] Error deleting temp file:", e);
    }
  }
};
