import { useState, useEffect } from 'react';
import {
  FiTwitter,
  FiCopy,
  FiCheck,
  FiClock,
  FiSend,
  FiPlus,
  FiList,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { documents, twitter } from '../services';

function TabButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center space-x-2 ${active
          ? 'bg-white text-indigo-600 border-t-2 border-indigo-500'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}

export default function TwitterPage() {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'all'
  const [documentsList, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [tweets, setTweets] = useState([]);
  const [allTweets, setAllTweets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Load documents and tweets on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [docs, tweets] = await Promise.all([
          documents.list(),
          twitter.listTweets()
        ]);

        setDocuments(docs);
        setAllTweets(tweets);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      }
    };

    loadInitialData();
  }, []);

  // Refresh tweets list
  const refreshTweets = async () => {
    try {
      setIsLoading(true);
      const tweets = await twitter.listTweets();
      setAllTweets(tweets);
      toast.success('Tweets refreshed');
    } catch (error) {
      console.error('Error refreshing tweets:', error);
      toast.error('Failed to refresh tweets');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTweets = async () => {
    if (!selectedDocument) {
      toast.error('Please select a document first');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating tweets for document:', selectedDocument);
      const generatedTweets = await twitter.generateTweets(selectedDocument);
      console.log('Generated tweets:', generatedTweets);

      // Ensure we have an array of tweets
      let newTweets = [];
      if (Array.isArray(generatedTweets)) {
        newTweets = generatedTweets;
      } else if (generatedTweets && Array.isArray(generatedTweets.tweets)) {
        newTweets = generatedTweets.tweets;
      } else if (generatedTweets && generatedTweets.content) {
        newTweets = [generatedTweets.content];
      } else {
        console.warn('Unexpected response format:', generatedTweets);
        toast.error('Unexpected response format from server');
        return;
      }

      setTweets(newTweets);

      // Refresh the all tweets list
      const updatedTweets = await twitter.listTweets();
      setAllTweets(updatedTweets);

      toast.success('Tweets generated successfully');
    } catch (error) {
      console.error('Error generating tweets:', error);
      toast.error(error.message || 'Failed to generate tweets');
    } finally {
      setIsGenerating(false);
    }
  };

  const postTweet = async (content, index) => {
    setIsPosting(index);
    try {
      await twitter.postTweet(content);
      toast.success('Tweet posted successfully!');
    } catch (error) {
      console.error('Error posting tweet:', error);
      toast.error(error.message || 'Failed to post tweet');
    } finally {
      setIsPosting(false);
    }
  };

  const scheduleTweet = async (content, index) => {
    if (!scheduledTime) {
      toast.error('Please select a schedule time');
      return;
    }

    setIsPosting(index);
    try {
      await twitter.scheduleTweet(content, scheduledTime);
      toast.success(`Tweet scheduled for ${new Date(scheduledTime).toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling tweet:', error);
      toast.error(error.message || 'Failed to schedule tweet');
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

  // Render a single tweet card
  const renderTweetCard = (tweet, index, isGenerated = false) => {
    const tweetContent = typeof tweet === 'string' ? tweet :
      tweet.content || tweet.text || JSON.stringify(tweet);
    const tweetDate = tweet.createdAt ? new Date(tweet.createdAt).toLocaleString() : 'Just now';
    const isPosted = tweet.status === 'posted';
    const isScheduled = tweet.status === 'scheduled';

    return (
      <div key={index} className="bg-white shadow overflow-hidden rounded-lg mb-4">
        <div className="p-4">
          <div className="flex justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FiTwitter className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">Twitter User</div>
                <div className="text-xs text-gray-500">
                  @username · {tweetDate}
                  {isPosted && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Posted
                    </span>
                  )}
                  {isScheduled && tweet.scheduledFor && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Scheduled: {new Date(tweet.scheduledFor).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(tweetContent, index)}
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
          </div>
          <div className="mt-3 text-gray-800 whitespace-pre-line">{tweetContent}</div>

          <div className="mt-4 flex justify-end space-x-3">
            {!isPosted && !isScheduled && (
              <>
                <div className="flex-1">
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <button
                  onClick={() => scheduleTweet(tweetContent, index)}
                  disabled={!scheduledTime || isPosting === index}
                  className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!scheduledTime || isPosting === index ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <FiClock className="mr-1.5 h-4 w-4 text-gray-500" />
                  {isPosting === index ? 'Scheduling...' : 'Schedule'}
                </button>
                <button
                  onClick={() => postTweet(tweetContent, index)}
                  disabled={isPosting === index}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isPosting === index ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <FiSend className="mr-1.5 h-4 w-4" />
                  {isPosting === index ? 'Posting...' : 'Post Now'}
                </button>
              </>
            )}
            {isScheduled && tweet.scheduledFor && (
              <div className="text-sm text-gray-500">
                Scheduled for {new Date(tweet.scheduledFor).toLocaleString()}
              </div>
            )}
            {isPosted && tweet.postedAt && (
              <div className="text-sm text-gray-500">
                Posted on {new Date(tweet.postedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Twitter Content</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <TabButton
            active={activeTab === 'generate'}
            onClick={() => setActiveTab('generate')}
            icon={FiPlus}
          >
            Generate Tweets
          </TabButton>
          <TabButton
            active={activeTab === 'all'}
            onClick={() => {
              setActiveTab('all');
              refreshTweets();
            }}
            icon={FiList}
          >
            All Tweets
            {allTweets.length > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {allTweets.length}
              </span>
            )}
          </TabButton>
        </nav>
      </div>

      {activeTab === 'generate' ? (
        <>
          {/* Document Selection */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Document</h2>
            <div className="flex space-x-4">
              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a document</option>
                {documentsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <button
                onClick={generateTweets}
                disabled={isGenerating || !selectedDocument}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isGenerating || !selectedDocument
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Tweets'}
              </button>
            </div>
          </div>

          {/* Generated Tweets */}
          <div className="mt-4">
            {tweets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FiTwitter className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tweets generated</h3>
                <p className="mt-1 text-gray-500">Select a document and click "Generate Tweets" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium text-gray-900">New Tweets</h3>
                </div>
                <div className="space-y-4">
                  {tweets.map((tweet, index) => renderTweetCard(tweet, index, true))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* All Tweets Tab */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">All Tweets</h3>
              <button
                onClick={refreshTweets}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {allTweets.length === 0 ? (
              <div className="text-center py-12">
                <FiTwitter className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No tweets yet</h3>
                <p className="mt-1 text-gray-500">Generate some tweets to see them here.</p>
              </div>
            ) : (
              allTweets.map((tweet, index) => renderTweetCard(tweet, `all-${index}`, true))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
