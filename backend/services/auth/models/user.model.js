import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: String,

    username: {
      type: String,
      sparse: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: String,

    provider: String,

    passwordHash: String,

    passwordSet: {
      type: Boolean,
      default: false,
    },

    plan: {
      type: String,
      default: "free",
    },

    credits: {
      type: Number,
      default: 100,
    },

    totalCredits: {
      type: Number,
      default: 100,
    },

    planExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
