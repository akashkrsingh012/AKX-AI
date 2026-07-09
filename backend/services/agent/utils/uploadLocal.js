import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadLocal = async (buffer, fileName) => {
  try {
    // Navigate from backend/services/agent/utils to backend/gateway/uploads
    const uploadDir = path.resolve(__dirname, "../../../gateway/uploads");
    
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    
    // Write the file
    await fs.writeFile(filePath, buffer);
    
    // Relative URL works through the Vite dev proxy and production gateway.
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Local Upload Error:", error);
    throw new Error("Failed to save file locally");
  }
};
