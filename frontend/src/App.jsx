import { useState, useEffect } from 'react';
import { api } from './api';
import linkedinApi from './services/linkedinApi';

function App() {
  const [activeTab, setActiveTab] = useState('documents');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLILoggedIn, setLILoggedIn] = useState(false);
  const [liAccessToken, setLIAccessToken] = useState('');

  // Load initial data
  useEffect(() => {
    fetchDocuments();
    fetchTweets();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTweets = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTweets();
      setTweets(data);
    } catch (err) {
      setError('Failed to load tweets');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.document.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      await api.uploadDocument(file);
      await fetchDocuments();
      setShowUploadModal(false);
      e.target.reset();
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTweets = async (docId) => {
    try {
      setIsLoading(true);
      await api.generateTweets(docId);
      await fetchTweets();
      alert('Tweets generated successfully!');
    } catch (err) {
      setError('Failed to generate tweets');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setIsLoading(true);
      await api.deleteDocument(docId);
      await fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostTweet = async (tweetId) => {
    try {
      setIsLoading(true);
      await api.postTweet(tweetId);
      // Refresh tweets
      await fetchTweets();
    } catch (err) {
      setError('Failed to post tweet');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // LinkedIn Authentication
  const handleLILogin = async () => {
    try {
      const authUrl = await linkedinApi.getAuthUrl();
      // Open LinkedIn auth in a popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        authUrl,
        'LinkedIn',
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );

      // Listen for the callback with the authorization code
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return;
        
        const { data } = event;
        if (data.type === 'linkedin-auth-success') {
          const { code } = data;
          try {
            const result = await linkedinApi.handleCallback(code);
            setLIAccessToken(result.accessToken);
            setLILoggedIn(true);
            window.removeEventListener('message', handleMessage);
          } catch (error) {
            console.error('LinkedIn auth error:', error);
            setError('Failed to authenticate with LinkedIn');
          }
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Error initiating LinkedIn login:', error);
      setError('Failed to connect to LinkedIn');
    }
  };

  // Post to LinkedIn
  const handlePostToLinkedIn = async (content) => {
    if (!isLILoggedIn) {
      const shouldLogin = window.confirm('You need to log in to LinkedIn first. Would you like to log in now?');
      if (shouldLogin) {
        await handleLILogin();
      }
      return;
    }

    try {
      setIsLoading(true);
      await linkedinApi.postContent(content, liAccessToken);
      alert('Successfully posted to LinkedIn!');
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      setError('Failed to post to LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleTweet = async (tweetId) => {
    const scheduledTime = prompt('Enter schedule time (YYYY-MM-DD HH:MM):');
    if (!scheduledTime) return;

    try {
      setIsLoading(true);
      await api.scheduleTweet(tweetId, scheduledTime);
      await fetchTweets();
      alert('Tweet scheduled successfully!');
    } catch (err) {
      setError('Failed to schedule tweet');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStats = async (tweetId) => {
    try {
      setIsLoading(true);
      const stats = await api.getTweetStats(tweetId);

      // Show stats in a modal or alert
      alert(`Tweet Statistics:\n` +
        `Likes: ${stats.like_count || 0}\n` +
        `Retweets: ${stats.retweet_count || 0}\n` +
        `Replies: ${stats.reply_count || 0}\n` +
        `Quotes: ${stats.quote_count || 0}`);
    } catch (err) {
      setError('Failed to fetch tweet stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .36.04.71.12 1.05-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.8.162-1.227.162-.3 0-.59-.03-.873-.086.59 1.84 2.303 3.18 4.333 3.217-1.587 1.244-3.588 1.985-5.763 1.985-.376 0-.747-.022-1.112-.065 2.062 1.322 4.51 2.093 7.14 2.093 8.57 0 13.254-7.1 13.254-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
            </svg>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TweetGenius Pro</h1>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Upload Document</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-4 md:p-8">
          <div className="container mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold mb-4">Twitter Bot Dashboard</h1>
              <nav className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-4 py-2 rounded ${activeTab === 'documents' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('tweets')}
                  className={`px-4 py-2 rounded ${activeTab === 'tweets' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Tweets
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="ml-auto px-4 py-2 bg-green-500 text-white rounded"
                >
                  Upload Document
                </button>
              </nav>
            </header>

            {isLoading && (
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Processing your request...</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start space-x-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Documents Section */}
              <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Your Documents
                  </h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload your first document to get started</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Upload Document
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map(doc => (
                      <div key={doc.id} className="group bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <h3 className="ml-3 text-sm font-medium text-gray-900 truncate">{doc.filename}</h3>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Uploaded: {new Date(doc.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleGenerateTweets(doc.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Generate Tweets"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete Document"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Tweets Section */}
              <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Generated Tweets
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documents
                    </button>
                    <button
                      onClick={() => setActiveTab('stats')}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg transition-all transform hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Stats
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {tweets.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tweets generated yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Upload a document and generate tweets to get started</p>
                    </div>
                  ) : (
                    tweets.map(tweet => (
                      <div key={tweet.id} className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-100 transition-all duration-200 hover:shadow-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 mb-3 leading-relaxed">{tweet.content || 'No content'}</p>

                            <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-4 mt-3">
                              <span className="inline-flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-1 ${tweet.status === 'posted' ? 'bg-green-500' :
                                  tweet.status === 'scheduled' ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`}></span>
                                {tweet.status || 'unknown'}
                              </span>
                              {tweet.filename && (
                                <span className="inline-flex items-center text-blue-600">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {tweet.filename}
                                </span>
                              )}
                              <span className="text-gray-400">
                                {tweet.created_at ? new Date(tweet.created_at).toLocaleString() : 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handlePostTweet(tweet.id)}
                              className="p-2 text-white bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
                              title="Post Now"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleScheduleTweet(tweet.id)}
                              className="p-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
                              title="Schedule"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewStats(tweet.id)}
                              className="p-2 text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
                              title="View Stats"
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handlePostToLinkedIn(tweet.content)}
                              className={`p-2 text-white bg-gradient-to-r ${isLILoggedIn ? 'from-blue-700 to-blue-800' : 'from-gray-500 to-gray-600'} hover:opacity-90 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center`}
                              title={isLILoggedIn ? 'Share on LinkedIn' : 'Login to LinkedIn to share'}
                              disabled={isLoading}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8.25 18.5h-3v-9h3v9zM6.75 8.25a1.75 1.75 0 110-3.5 1.75 1.75 0 010 3.5zM19.5 18.5h-3v-4.75c0-.83-.015-1.9-1.157-1.9-1.158 0-1.343.905-1.343 1.84v4.81h-3v-9h2.9v1.24h.04c.35-.67 1.22-1.38 2.51-1.38 2.69 0 3.19 1.77 3.19 4.07v5.07z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Upload Document</h2>
                  <form onSubmit={handleUpload}>
                    <input
                      type="file"
                      name="document"
                      accept=".pdf,.docx,.txt"
                      className="mb-4 w-full p-2 border rounded"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
