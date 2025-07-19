import { useState, useEffect } from 'react';
import { FiLinkedin, FiCopy, FiCheck, FiClock, FiSend, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { documents, linkedin } from '../services';

export default function LinkedInPage() {
  const [documentsList, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [posts, setPosts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if LinkedIn is connected
  useEffect(() => {
    setIsLinkedInConnected(linkedin.isConnected());
  }, []);

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await documents.list();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
        toast.error('Failed to load documents');
      }
    };

    loadDocuments();
  }, []);

  const connectLinkedIn = async () => {
    setIsConnecting(true);
    try {
      const url = await linkedin.getAuthUrl();
      // Open the authorization URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Please complete the LinkedIn authorization in the new tab');
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      toast.error(error.message || 'Failed to connect to LinkedIn');
    } finally {
      setIsConnecting(false);
    }
  };

  const generatePosts = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document first');
      return;
    }

    setIsGenerating(true);
    try {
      // Get the document content first
      const document = await documents.getById(selectedDocument);
      // Generate variations of the post
      const variations = await linkedin.generatePostVariations(document.content);
      setPosts(variations);
      toast.success('LinkedIn posts generated successfully');
    } catch (error) {
      console.error('Error generating LinkedIn posts:', error);
      toast.error(error.message || 'Failed to generate LinkedIn posts');
    } finally {
      setIsGenerating(false);
    }
  };

  const postToLinkedIn = async (content, index) => {
    if (!isLinkedInConnected) {
      toast.error('Please connect your LinkedIn account first');
      return;
    }

    setIsPosting(index);
    try {
      await linkedin.postContent(content);
      toast.success('Posted to LinkedIn successfully!');
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      toast.error(error.message || 'Failed to post to LinkedIn');
    } finally {
      setIsPosting(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiLinkedin className="mr-2 text-blue-600" />
          LinkedIn Content Generator
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and post professional content to LinkedIn
        </p>
      </div>

      {/* LinkedIn Connection Status */}
      {!isLinkedInConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your LinkedIn account is not connected. Please connect to post directly to LinkedIn.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={connectLinkedIn}
                  disabled={isConnecting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isConnecting ? 'Connecting...' : 'Connect LinkedIn Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Selection */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">
              Select a document
            </label>
            <select
              id="document"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
            >
              <option value="">Select a document</option>
              {documentsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={generatePosts}
              disabled={!selectedDocument || isGenerating}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                !selectedDocument || isGenerating
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate LinkedIn Posts'}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Generated LinkedIn Posts</h2>
          
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
                <div className="p-6">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiLinkedin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Your Name</div>
                        <div className="text-sm text-gray-500">Your Headline</div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(post, index)}
                      className="text-gray-400 hover:text-gray-500"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <FiCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <FiCopy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4 text-gray-800 whitespace-pre-line">
                    {post}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => copyToClipboard(post, index)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FiCopy className="mr-1.5 h-4 w-4 text-gray-500" />
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                      
                      <button
                        onClick={() => postToLinkedIn(post, index)}
                        disabled={!isLinkedInConnected || isPosting === index}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          !isLinkedInConnected || isPosting === index ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <FiSend className="mr-1.5 h-4 w-4" />
                        {isPosting === index ? 'Posting...' : 'Post to LinkedIn'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* LinkedIn Posting Tips */}
      {posts.length === 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tips for Great LinkedIn Posts
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>• Start with a compelling hook to grab attention</p>
              <p>• Keep paragraphs short and scannable</p>
              <p>• Include relevant hashtags (3-5 is ideal)</p>
              <p>• Ask questions to encourage engagement</p>
              <p>• Add value with insights or actionable advice</p>
            </div>
            <div className="mt-5">
              <a
                href="https://www.linkedin.com/help/linkedin/answer/a4249/linkedin-best-practices-posts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Learn more about LinkedIn best practices
                <FiExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
