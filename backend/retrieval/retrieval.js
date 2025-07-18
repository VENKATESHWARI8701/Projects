const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { Pinecone } = require('@pinecone-database/pinecone');
const { BufferMemory } = require('langchain/memory');
require('dotenv').config();

// Set up Pinecone client
const pinecone = new Pinecone();
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// Initialize memory storage for chat history
const chatMemories = {};

const getAnswerFromModel = async (question, streaming = false, sessionId = 'default') => {
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
        topK: 5,
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
    const prompt = ` You are an AI assistant. You can answer any question. Use the following context and conversation history to answer the user's question.

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

    if (streaming) {
        const stream = model.stream(prompt);
        // Save the conversation after streaming starts
        saveConversation(sessionId, question, 'Streaming response...');
        return stream;
    } else {
        const stream = await model.stream(prompt);
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk.content;
        }
        // Save the conversation
        saveConversation(sessionId, question, fullResponse);
        return fullResponse;
    }
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

// Function to clear chat history for a session
const clearChatHistory = async (sessionId = 'default') => {
    if (chatMemories[sessionId]) {
        delete chatMemories[sessionId];
        return true;
    }
    return false;
};

module.exports = { getAnswerFromModel, clearChatHistory };
