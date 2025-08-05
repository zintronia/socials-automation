const documentModel = require('../models/document.model');
const documentParser = require('./documentParser');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');

// Configure upload directory
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

class DocumentService {
  async uploadDocument(userId, file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const filepath = path.join(uploadDir, file.originalname);

    console.log('Full filepath:', filepath);
    console.log('File info:', {
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype
    });

    // Ensure upload directory exists
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }

    try {
      // Copy file to its final location with original name
      fs.copyFileSync(file.path, filepath);

      // Parse document content
      const content = await documentParser.parseDocument(filepath);
      console.log("\n=== Document Content ===");
      console.log("Content length:", content.length);
      console.log("First 100 characters:", content.slice(0, 100));
      console.log("Last 100 characters:", content.slice(-100));
      console.log("=== End of Document Content ===\n");

      // Save to database with user association
      const document = await documentModel.create({
        filename: file.originalname,
        filepath: filepath,
        content: content,
        user_id: userId,
        mimetype: file.mimetype,
        size: file.size
      });

      console.log("Document saved with ID:", document.id);

      return {
        id: document.id,
        filename: file.originalname,
        filepath: filepath,
        contentLength: content.length
      };
    } catch (error) {
      // Clean up the uploaded file if there was an error
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  async listUserDocuments(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Get documents for the current page
      const documents = await documentModel.findByUserId(userId, limit, offset);
      
      // Get total count for pagination
      const total = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', [userId], (err, row) => {
          if (err) reject(err);
          resolve(row ? row.count : 0);
        });
      });

      // Transform documents to match frontend's expected structure
      const formattedDocuments = Array.isArray(documents) ? documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        filepath: doc.filepath,
        content: doc.content,
        mimetype: doc.mimetype,
        size: doc.size,
        created_at: doc.created_at,
        user_id: doc.user_id
      })) : [];

      return {
        documents: formattedDocuments,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: parseInt(total, 10),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  }

  async deleteDocument(docId, userId) {
    try {
      return await documentModel.deleteDocument(docId, userId);
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async cleanupOrphanedFiles() {
    return documentModel.cleanupOrphanedFiles();
  }
}

// Export singleton instance
module.exports = new DocumentService();
