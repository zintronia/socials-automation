const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const documentParser = {
  async parsePDF(filepath) {
    try {
      console.log("Starting PDF parsing for:", filepath);
      const dataBuffer = fs.readFileSync(filepath);
      const data = await pdf(dataBuffer);
      console.log("PDF parsing successful, content length:", data.text.length);
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  },

  async parseDOCX(filepath) {
    try {
      console.log("Starting DOCX parsing for:", filepath);
      const result = await mammoth.extractRawText({ path: filepath });
      console.log("DOCX parsing successful, content length:", result.value.length);
      return result.value;
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw error;
    }
  },

  async parseTXT(filepath) {
    try {
      console.log("Starting TXT parsing for:", filepath);
      const content = await fs.promises.readFile(filepath, 'utf-8');
      console.log("TXT parsing successful, raw content length:", content.length);

      // Remove whitespace and check if content is empty
      const trimmedContent = content.trim();
      if (trimmedContent.length === 0) {
        throw new Error('Document content is empty after removing whitespace');
      }

      console.log("TXT content length after trim:", trimmedContent.length);
      return trimmedContent;
    } catch (error) {
      console.error('Error parsing TXT:', error);
      throw error;
    }
  },

  async parseDocument(filepath) {
    try {
      console.log("\n=== Document Parsing Started ===");
      console.log("File path:", filepath);

      const ext = path.extname(filepath).toLowerCase();
      console.log("File extension:", ext);

      // Ensure we have a valid extension
      if (!ext) {
        const filename = path.basename(filepath);
        throw new Error(`Unable to determine file extension for: ${filename}`);
      }

      // Read file content first
      const content = await fs.promises.readFile(filepath, 'utf-8');
      console.log("Raw content length:", content.length);
      console.log("First 100 characters of raw content:", content.slice(0, 100));

      // Validate content
      const trimmedContent = content.trim();
      if (trimmedContent.length === 0) {
        throw new Error('Document content is empty after removing whitespace');
      }

      // Check for common empty document indicators
      const emptyIndicators = ['empty', 'no content', 'not available'];
      if (emptyIndicators.some(indicator => trimmedContent.toLowerCase().includes(indicator))) {
        throw new Error('Document contains empty content indicators');
      }

      // If it's a text file, return the content directly
      if (ext === '.txt') {
        console.log("Final TXT content length:", trimmedContent.length);
        return trimmedContent;
      }

      // For other formats, use appropriate parser
      switch (ext) {
        case '.pdf':
          console.log("\n=== Parsing PDF ===");
          const pdfContent = await this.parsePDF(filepath);
          console.log("PDF content length:", pdfContent.length);
          return pdfContent;
        case '.docx':
          console.log("\n=== Parsing DOCX ===");
          const docxContent = await this.parseDOCX(filepath);
          console.log("DOCX content length:", docxContent.length);
          return docxContent;
        default:
          throw new Error(`Unsupported file format: ${ext}`);
      }
    } catch (error) {
      console.error('\n=== Document Parsing Error ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }
};

module.exports = documentParser;
