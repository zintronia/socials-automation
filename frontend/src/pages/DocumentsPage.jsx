import { useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiFileText, FiFile, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { documents } from '../services';

export default function DocumentsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [documentsList, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      const docs = await documents.list();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      await documents.upload(selectedFile);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documents.delete(id);
        toast.success('Document deleted');
        await loadDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  // Load documents on component mount
  useState(() => {
    loadDocuments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage your documents for content generation
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Upload a document</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload PDF, DOCX, or TXT files to generate social media content
              </p>
            </div>
            
            <div className="mt-4 flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex items-center">
                  <FiUpload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Select file'}
                </div>
              </label>
              
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  !selectedFile || isUploading
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Supported formats: PDF, DOCX, TXT</p>
              <p className="text-xs text-gray-400 mt-1">
                Max file size: 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {documentsList.length === 0 ? (
            <li className="p-4 text-center text-gray-500">
              No documents found. Upload a document to get started.
            </li>
          ) : (
            documentsList.map((doc) => (
              <li key={doc.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      {doc.filename.endsWith('.pdf') ? (
                        <FiFile className="h-8 w-8 text-red-500" />
                      ) : doc.filename.endsWith('.docx') ? (
                        <FiFileText className="h-8 w-8 text-blue-500" />
                      ) : (
                        <FiFile className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div className="text-sm font-medium text-indigo-600 truncate">
                        {doc.filename}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Delete document"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
