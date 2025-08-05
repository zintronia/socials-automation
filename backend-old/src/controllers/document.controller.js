const documentService = require('../services/document.service');
const { validationResult } = require('express-validator');
const fs = require('fs');

class DocumentController {
  async upload(req, res, next) {
    try {
      const { file } = req;
      const userId = req.user?.id;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const document = await documentService.uploadDocument(userId, file);
      
      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      // Clean up the uploaded file if there was an error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await documentService.listUserDocuments(
        userId,
        parseInt(page, 10),
        parseInt(limit, 10)
      );

      res.json({
        success: true,
        data: result.documents || [],
        pagination: result.pagination || {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: 0,
          pages: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      await documentService.deleteDocument(id, userId);
      
      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Cleanup method to be called periodically
  async cleanupOrphanedFiles() {
    try {
      const result = await documentService.cleanupOrphanedFiles();
      console.log(`Cleaned up ${result.deleted} orphaned files`);
      return result;
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
      throw error;
    }
  }
}

// Create singleton instance
const documentController = new DocumentController();

// Set up periodic cleanup (every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(() => {
  documentController.cleanupOrphanedFiles()
    .catch(err => console.error('Error in scheduled cleanup:', err));
}, CLEANUP_INTERVAL);

module.exports = documentController;
