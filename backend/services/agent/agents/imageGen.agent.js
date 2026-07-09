import axios from "axios";
import { getModel, invokeModel } from "../utils/model.js";
import { uploadFile } from "../utils/uploadFile.js";
import { checkAgentLimit } from "../config/agentRateLimit.js";
import { deductCredits } from "../utils/deductCredits.js";

export const imageAgent = async (state) => {

  try {

await checkAgentLimit(
    state.userId,
    "image"
  );
 await deductCredits(

        state.userId,

        "image"

    );


    let enhancedPrompt = state.prompt;

    try {
      const llm = getModel("image");
      const promptResponse = await invokeModel(llm, `

You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the image prompt.

User Request:

${state.prompt}

`);
      enhancedPrompt = promptResponse.content.trim();
    } catch (promptError) {
      console.warn("Image prompt enhancement skipped:", promptError.message);
    }

    const imageUrl =
      `https://image.pollinations.ai/prompt/${encodeURIComponent(
        enhancedPrompt
      )}`;

    return {
      ...state,
      images: [imageUrl],
      response: `
# 🖼️ Image Generated Successfully

![Generated Image](${imageUrl})

📥 [Download Image](${imageUrl})
`
    };

  } catch (error) {

    console.log(
      "Image Agent Error:",
      error
    );

    return {

      ...state,

      response:
        "❌ Failed to generate image."

    };

  }

};