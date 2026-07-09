import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is required in environment variables");
  }

  mongoose.set("strictQuery", false);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Connecting to MongoDB... (attempt ${attempt}/${MAX_RETRIES})`);
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("DB Connected");
      return;
    } catch (error) {
      console.error(`DB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);

      if (attempt === MAX_RETRIES) {
        console.error("Max retries reached. Starting server without DB — requests will fail until DB is available.");
        // Don't throw — let the server start so nodemon keeps it alive
        return;
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

// Auto-reconnect on disconnect
mongoose.connection.on("disconnected", () => {
  console.warn("[DB] Disconnected from MongoDB. Attempting to reconnect...");
  setTimeout(() => connectDB(), RETRY_DELAY_MS);
});

export default connectDB;