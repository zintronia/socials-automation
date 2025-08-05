const BaseRepository = require('./base/BaseRepository');
const fs = require('fs');
const path = require('path');
const { db } = require('../config/database');

class DocumentModel extends BaseRepository {
  constructor() {
    super('documents');
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findByUserId(userId, limit = 10, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM documents 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      db.all(query, [userId, limit, offset], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  async createWithFile(userId, file, content) {
    const filepath = path.join(this.uploadDir, file.originalname);

    // Ensure directory exists
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }

    // Move file to uploads directory
    fs.copyFileSync(file.path, filepath);

    // Save document metadata to database
    const docData = {
      filename: file.originalname,
      filepath: filepath,
      content: content,
      user_id: userId,
      mimetype: file.mimetype,
      size: file.size
    };

    const docId = await this.create(docData);
    return { id: docId, ...docData };
  }

  async deleteDocument(docId, userId) {
    // First get the document to check ownership and get filepath
    const doc = await this.findOne(docId);

    if (!doc) {
      throw new Error('Document not found');
    }

    if (doc.user_id !== userId) {
      throw new Error('Unauthorized to delete this document');
    }

    // Delete the file
    if (fs.existsSync(doc.filepath)) {
      fs.unlinkSync(doc.filepath);
    }

    // Delete from database
    await this.delete(docId);

    return true;
  }

  async cleanupOrphanedFiles() {
    try {
      // Get all files in upload directory
      const files = fs.readdirSync(this.uploadDir);

      // Get all filepaths from database
      const dbFiles = await new Promise((resolve, reject) => {
        db.all('SELECT filepath FROM documents', [], (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.filepath));
        });
      });

      // Find orphaned files (exist on disk but not in database)
      const orphanedFiles = files.filter(file =>
        !dbFiles.includes(path.join(this.uploadDir, file))
      );

      // Delete orphaned files
      orphanedFiles.forEach(file => {
        try {
          fs.unlinkSync(path.join(this.uploadDir, file));
          console.log(`Deleted orphaned file: ${file}`);
        } catch (err) {
          console.error(`Error deleting file ${file}:`, err);
        }
      });

      return { deleted: orphanedFiles.length };
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
      throw error;
    }
  }
}

module.exports = new DocumentModel();
