import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY!,
  //environment: process.env.PINECONE_ENVIRONMENT!,
});

// Get the index
export const pineconeIndex = pinecone.index("codebunny24-vector-embeddings");
