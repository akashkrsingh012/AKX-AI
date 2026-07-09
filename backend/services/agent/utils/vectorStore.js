import { QdrantVectorStore }
from "@langchain/qdrant";
import { getEmbeddings } from "./embedding.js";



export const createVectorStore =
async(

collectionName,

docs

)=>{

    return await QdrantVectorStore.fromDocuments(

        docs,

        getEmbeddings(),

        {

            url:
            process.env.QDRANT_URL,

            apiKey:
            process.env.QDRANT_API_KEY,

            collectionName

        }

    );

};