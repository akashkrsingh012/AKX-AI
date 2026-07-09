import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not set — DB features will not work.");
    return;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Connecting to MongoDB... (attempt ${attempt}/${MAX_RETRIES})`);
      await mongoose.connect(process.env.MONGODB_URL);
      console.log("DB Connected");
      return;
    } catch (error) {
      console.error(`DB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, error.message);

      if (attempt === MAX_RETRIES) {
        console.error("Max retries reached. Server running without DB.");
        return;
      }

      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] Disconnected from MongoDB. Attempting to reconnect...");
  setTimeout(() => connectDB(), RETRY_DELAY_MS);
});

export default connectDB;