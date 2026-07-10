import Message from "../../chat/models/message.model.js";

export const getConversationHistory = async (conversationId) => {
  try {
    const messages = await Message.find({
      conversationId: conversationId,
    }).sort({
      createdAt: 1,
    });
    return messages;
  } catch (error) {
    console.error("Failed to get conversation history:", error);
    throw error;
  }
};