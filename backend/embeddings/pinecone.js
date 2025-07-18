require("dotenv").config();
const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME) ?? "langchain-project-index";

async function createIndexIfNotExists() {
    try {
        const indexes = await pinecone.listIndexes();
        // console.log("index", index);
        console.log(indexes.indexes)
        const indexExists = indexes.indexes.some(
            (pineconeIdx) => pineconeIdx.name === process.env.PINECONE_INDEX_NAME
        );

        if (!indexExists) {
            console.log(`Creating index "${index}"...`);
            await pinecone.createIndex({
                name: index,
                dimension: 768,
                metric: "cosine",
                spec: {
                    serverless: {
                        cloud: "aws",
                        region: process.env.PINECONE_ENVIRONMENT ?? "us-east-1"
                    }
                }
            });
            console.log(`Index "${index}" created.`);
        } else {
            console.log(`Index "${index}" already exists.`);
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

    await createIndexIfNotExists();

    await PineconeStore.fromTexts(
        chunks,
        metadata,
        embeddings,
        { pineconeIndex: index }
    );
};

const deleteFromPinecone = async (namespace) => {
    console.log("namespace here", namespace);
    await index._deleteAll({ namespace });
};

module.exports = { embedAndStore, deleteFromPinecone };
