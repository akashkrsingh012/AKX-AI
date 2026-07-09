import fs from "fs/promises";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { getModel, invokeModel } from "../utils/model.js";

import { checkAgentLimit } from "../config/agentRateLimit.js";

import { deductCredits } from "../utils/deductCredits.js";

export const visionAgent = async (state) => {

  try {

    await checkAgentLimit(
      state.userId,
      "image"
    );

    await deductCredits(
      state.userId,
      "image"
    );

    const llm =
      getModel("vision");

    const imageBuffer =
      await fs.readFile(
        state.file.path
      );

    const base64Image =
      imageBuffer.toString("base64");

    const messages = [

      new SystemMessage(`

You are AKX AI Vision Agent.

Rules:

- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use Markdown when helpful.
- Do not hallucinate.

`),

      new HumanMessage({

        content: [

          {

            type: "text",

            text:

              state.prompt ||

              "Describe this image."

          },

          {

            type: "image_url",

            image_url: {

              url: `data:${state.file.mimetype};base64,${base64Image}`

            }

          }

        ]

      })

    ];

    const response =
      await invokeModel(llm,
        messages
      );

    return {

      ...state,

      response:
        response.content

    };

  } catch (error) {

    console.log("Vision Agent Error:", error);

    return {
      ...state,
      response: "❌ Failed to process the image."
    };

  } finally {

    if(state.file){

      try{

        await fs.unlink(
          state.file.path
        );

        console.log(
          "Deleted:",
          state.file.path
        );

      }

      catch(err){

        console.log(
          err.message
        );

      }

    }

  }

};