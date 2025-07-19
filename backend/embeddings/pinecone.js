require("dotenv").config();
const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = process.env.PINECONE_INDEX_NAME || "langchain-project-index";
const index = pinecone.Index(indexName);

async function createIndexIfNotExists(indexName) {
    try {
        const indexes = await pinecone.listIndexes();
        console.log("Available indexes", indexes.indexes);

        const indexExists = indexes.indexes.some(
            (pineconeIdx) => pineconeIdx.name === indexName
        );

        if (!indexExists) {
            console.log(`Creating index "${indexName}"...`);
            await pinecone.createIndex({
                name: indexName,
                dimension: 768,
                metric: "cosine",
                spec: {
                    serverless: {
                        cloud: "aws",
                        region: process.env.PINECONE_ENVIRONMENT || "us-east-1"
                    }
                }
            });
            console.log(`Index "${indexName}" created.`);
        } else {
            console.log(`Index "${indexName}" already exists.`);
        }
    } catch (error) {
        console.error("Error creating Pinecone index:", error);
    }
}

const embedAndStore = async (chunks, metadata = {}) => {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        taskType: "RETRIEVAL_DOCUMENT",
        title: "Embeddings for " + metadata.title
    });

    await createIndexIfNotExists(indexName);

    await PineconeStore.fromTexts(
        chunks,
        metadata,
        embeddings,
        { pineconeIndex: index }
    );
};

const deleteFromPinecone = async (namespace) => {
    console.log("Deleting namespace:", namespace);
    await index._deleteAll({ namespace });
};

module.exports = { embedAndStore, deleteFromPinecone };
