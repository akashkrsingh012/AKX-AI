import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadLocal = async (buffer, fileName) => {
  try {
    // Store uploads in the agent service's own uploads folder.
    // The unified server serves this via /uploads static route.
    const uploadDir = path.resolve(__dirname, "../uploads");

    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Write the file
    await fs.writeFile(filePath, buffer);

    // Relative URL served via /uploads static route on the unified server
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Local Upload Error:", error);
    throw new Error("Failed to save file locally");
  }
};
