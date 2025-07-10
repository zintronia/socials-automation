const db = require('../config/database');
const documentParser = require('../services/documentParser');
const path = require('path');
const fs = require('fs');

// Configure upload directory
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const documentController = {
  upload: async (req, res) => {
    try {
      const { file } = req;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
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

      // Copy file to its final location with original name
      fs.copyFileSync(file.path, filepath);

      try {
        // Parse document content
        const content = await documentParser.parseDocument(filepath);
        console.log("\n=== Document Content ===");
        console.log("Content length:", content.length);
        console.log("First 100 characters:", content.slice(0, 100));
        console.log("Last 100 characters:", content.slice(-100));
        console.log("=== End of Document Content ===\n");

        // Save to database
        const result = await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO documents (filename, filepath, content)
            VALUES (?, ?, ?)
          `, [file.originalname, filepath, content], function(err) {
            if (err) reject(err);
            resolve(this);
          });
        });

        console.log("Document saved with ID:", result.lastID);
        
        res.json({
          id: result.lastID,
          filename: file.originalname,
          filepath: filepath,
          contentLength: content.length
        });
      } catch (error) {
        console.error('Error uploading document:', error);
        
        // Delete the uploaded file since processing failed
        try {
          fs.unlinkSync(filepath);
          console.log('Deleted failed upload:', filepath);
        } catch (delError) {
          console.error('Error deleting failed upload:', delError);
        }

        // Handle empty document error specifically
        if (error.message.includes('empty after removing whitespace')) {
          return res.status(400).json({
            error: 'The uploaded document appears to be empty. Please ensure the file contains text content.'
          });
        }
        
        // Handle other errors
        return res.status(500).json({
          error: 'Failed to process document',
          details: error.message
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Add a cleanup function for failed uploads
  cleanupFailedUploads: async () => {
    try {
      const docs = await new Promise((resolve, reject) => {
        db.all('SELECT id, filepath FROM documents WHERE content IS NULL OR content = ?', [''], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });

      for (const doc of docs) {
        try {
          fs.unlinkSync(doc.filepath);
          console.log('Cleaned up failed upload:', doc.filepath);
          
          // Remove from database
          await new Promise((resolve, reject) => {
            db.run('DELETE FROM documents WHERE id = ?', [doc.id], function(err) {
              if (err) reject(err);
              resolve();
            });
          });
        } catch (error) {
          console.error('Error cleaning up document:', error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up failed uploads:', error);
    }
  },

  list: async (req, res) => {
    try {
      const docs = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM documents ORDER BY created_at DESC', (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      res.json(docs);
    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({ error: 'Failed to list documents' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const doc = await new Promise((resolve, reject) => {
        db.get('SELECT filepath FROM documents WHERE id = ?', [id], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (doc) {
        fs.unlinkSync(doc.filepath);
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM documents WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }
};

// Set up periodic cleanup
setInterval(documentController.cleanupFailedUploads, 60000); // Run every minute

module.exports = documentController;

module.exports = documentController;
