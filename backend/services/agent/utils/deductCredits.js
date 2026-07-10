import User from "../../auth/models/user.model.js";

export const deductCredits = async (userId, agent) => {
  if (!userId || userId === "undefined" || process.env.NODE_ENV !== "production") {
    return;
  }

  try {
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10,
    };

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      err.data = {
        success: false,
        title: "User Not Found",
        message: "User not found.",
      };
      throw err;
    }

    const requiredCredits = COST[agent] || 1;

    if (user.credits < requiredCredits) {
      const err = new Error("Insufficient Credits");
      err.status = 400;
      err.data = {
        success: false,
        title: "Insufficient Credits",
        message: "You don't have enough credits. Please upgrade your plan.",
      };
      throw err;
    }

    user.credits -= requiredCredits;
    await user.save();
  } catch (error) {
    if (error.data) {
      throw error;
    }
    const err = new Error(error.message || "Failed to deduct credits.");
    err.status = 500;
    err.data = {
      success: false,
      title: "Error",
      message: "Internal server error during credit deduction.",
    };
    throw err;
  }
};