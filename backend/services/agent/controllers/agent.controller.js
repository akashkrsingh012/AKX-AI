import { graph } from "../graph/supervisor.graph.js";
import { addMessage } from "../utils/memory.js";
import { getAIMode, getConfiguredProviders, getActiveModelName } from "../utils/model.js";
import Message from "../../chat/models/message.model.js";

export const chat = async (req, res, next) => {
  try {
    const body = req.body || {};
    const prompt = body.prompt || req.body?.prompt || req.query?.prompt;
    const conversationId = body.conversationId || req.query?.conversationId;
    const agent = body.agent || req.query?.agent;

    if (!prompt?.trim()) {
      return res.status(400).json({
        success: false,
        title: "Empty message",
        message: "Please enter a message before sending.",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        title: "Missing conversation",
        message: "No conversation selected.",
      });
    }

    await addMessage(conversationId, "user", prompt);

    // Save user message directly to the database
    await Message.create({
      conversationId,
      role: "user",
      content: prompt,
    });

    const result = await graph.invoke({
      prompt,
      conversationId,
      userId: req.headers["x-user-id"],
      agent,
      file: req.file,
    });

    const answer = result.response || "I couldn't generate a response. Please try again.";

    await addMessage(conversationId, "assistant", answer);

    // Save assistant message directly to the database
    await Message.create({
      conversationId,
      role: "assistant",
      content: answer,
      images: result.images,
      artifacts: result.artifacts || [],
    });

    return res.json({
      success: true,
      answer,
      aiMode: getAIMode(),
      model: getActiveModelName(),
      images: result.images || [],
      artifacts: result.artifacts || [],
    });
  } catch (error) {
    next(error);
  }
};
