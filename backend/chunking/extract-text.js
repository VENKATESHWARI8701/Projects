const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const cheerio = require("cheerio");

const extractText = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  try {
    // Handle PDF files
    if (extension === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }

    // Handle DOC/DOCX files
    else if (extension === ".doc" || extension === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // Handle HTML/HTM files
    else if (extension === ".html" || extension === ".htm") {
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      const $ = cheerio.load(htmlContent);
      // Remove script and style elements
      $('script, style').remove();
      // Get text content
      return $('body').text().trim();
    }

    // Handle text files
    else if (extension === ".txt") {
      return fs.readFileSync(filePath, 'utf8');
    }

    // Unsupported file type
    else {
      throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
};

module.exports = extractText;
