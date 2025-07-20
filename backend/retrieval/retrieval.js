const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { BufferMemory } = require('langchain/memory');
require('dotenv').config();

// Set up Pinecone client
const pinecone = new Pinecone();
const indexName = process.env.PINECONE_INDEX_NAME || "langchain-project-index";
const index = pinecone.Index(indexName);

// Initialize memory storage for chat history
const chatMemories = {};

const getAnswerFromModel = async (question, sessionId = 'default') => {
    console.log("Getting answer");
    // Initialize memory for this session if it doesn't exist
    if (!chatMemories[sessionId]) {
        chatMemories[sessionId] = new BufferMemory();
    }
    // 1. Embed the query
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        // taskType: "RETRIEVAL_QUERY",
        // title: "Embedding for user query"
    });

    const queryEmbedding = await embeddings.embedQuery(question);

    // 2. Perform similarity search on Pinecone
    const pineconeResponse = await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true
    });

    const relevantChunks = pineconeResponse.matches
        ?.map(match => match.metadata?.text || '')
        ?.filter(Boolean)
        ?.join('\n---\n');

    // 3. Get chat history
    const chatHistory = await chatMemories[sessionId].loadMemoryVariables({});
    const previousMessages = chatHistory.history || '';
    // 4. Construct prompt with retrieved context and chat history
    const prompt = ` You are a helpful AI assistant specialized in analyzing and summarizing documents. Your primary tasks are:
 1. Providing clear and accurate summaries of uploaded documents
 2. Answering specific questions about the document content
 3. Maintaining a professional and friendly tone

 When responding:
 - Base your answers strictly on the provided context and document content
 - If a question is unclear or ambiguous, answer with the context and politely ask for clarification
 - If the answer cannot be found in the document context, honestly acknowledge this
 - Provide relevant quotes or references from the document when applicable
 - Keep responses concise but informative

 Use the following context and conversation history to assist the user:

        Context:
        ${relevantChunks || 'No relevant context found.'}

        Conversation History:
        ${previousMessages}

        User Question:
        ${question}`;

    // 5. Use Gemini to respond
    const model = new ChatGoogleGenerativeAI({
        model: 'gemini-2.0-flash',
        temperature: 0,
    });

    console.log("Prompt:", prompt);
    const stream = model.stream(prompt);
    return stream;
};

// Helper function to save conversation to memory
const saveConversation = async (sessionId, question, answer) => {
    if (!chatMemories[sessionId]) {
        chatMemories[sessionId] = new BufferMemory();
    }

    await chatMemories[sessionId].saveContext(
        { input: question },
        { output: answer }
    );
};


module.exports = { getAnswerFromModel, saveConversation };
