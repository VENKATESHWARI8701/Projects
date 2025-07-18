const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const splitText = async (text) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return await splitter.createDocuments([text]);
};

module.exports = splitText;
