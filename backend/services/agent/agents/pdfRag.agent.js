import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createVectorStore } from "../utils/vectorStore.js";
import {
  HumanMessage,
  SystemMessage
} from "@langchain/core/messages";

import { getModel, invokeModel } from "../utils/model.js";

export const pdfRagAgent = async (state) => {
  let collectionName = null;

  try {

    const buffer =
      fs.readFileSync(
        state.file.path
      );

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const text = result.text;

    const splitter =
      new RecursiveCharacterTextSplitter({

        chunkSize: 1000,

        chunkOverlap: 200

      });

    const docs =
      await splitter.createDocuments([

        text

      ]);

   collectionName =
`pdf-${Date.now()}`;

const vectorStore =await createVectorStore(

collectionName,

docs

);

const relevantDocs =
await vectorStore.similaritySearch(

    state.prompt,

    5

);
console.log(relevantDocs);
const context =
relevantDocs

.map(doc=>doc.pageContent)

.join("\n\n");
const llm = getModel("chat");

    const messages=[

new SystemMessage(`

You are AKX AI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.

- Never make up information.

- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.

`),

new HumanMessage(`

Context:

${context}

Question:

${state.prompt}

`)
];


const response = await invokeModel(llm, messages);


    return {

      ...state,

      docs,

      response:
response.content
    };

  } catch (error) {

    console.log("PDF RAG Agent Error:", error);

    return {
      ...state,
      response: "❌ Failed to process the PDF. Please try again."
    };

  } finally{

    try{

        if (state.file && state.file.path) {
            fs.unlinkSync(state.file.path);
        }

    }

    catch(err){

        console.log(err.message);

    }

}

};