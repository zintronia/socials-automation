document.addEventListener('DOMContentLoaded', () => {
    const uploadModal = document.getElementById('uploadModal');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadForm = document.getElementById('uploadForm');
    const documentsGrid = document.getElementById('documentsGrid');
    const tweetsGrid = document.getElementById('tweetsGrid');
    const statsGrid = document.getElementById('statsGrid');

    // Show/hide modal
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'flex';
    });

    // Close modal when clicking outside
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // Handle document upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                updateDocumentsList();
                uploadModal.style.display = 'none';
                uploadForm.reset();
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document');
        }
    });

    // Update documents list
    const updateDocumentsList = async () => {
        try {
            const response = await fetch('/api/documents');
            const documents = await response.json();

            documentsGrid.innerHTML = documents.map(doc => `
            <div class="card" data-doc-id="${doc.id}">
                <h3>${doc.filename}</h3>
                <p>Uploaded: ${new Date(doc.created_at).toLocaleString()}</p>
                <button class="generate-tweets-btn">Generate Tweets</button>
                <button class="delete-doc-btn">Delete</button>
            </div>
        `).join('');

            // Add event listeners for generate tweets buttons
            documentsGrid.querySelectorAll('.generate-tweets-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const docId = card.dataset.docId;
                    await generateTweets(docId);
                });
            });

            // Add event listeners for delete buttons
            documentsGrid.querySelectorAll('.delete-doc-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const docId = card.dataset.docId;
                    await deleteDocument(docId);
                });
            });
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // Generate tweets
    const generateTweets = async (documentId) => {
        try {
            console.log('Generating tweets for document:', documentId);
            const response = await fetch(`/api/tweets/generate/${documentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ count: 3 })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Successfully generated tweets:', data);
                updateTweetsList();
                alert('Tweets generated successfully!');
            } else {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(errorData.error || 'Failed to generate tweets');
            }
        } catch (error) {
            console.error('Error generating tweets:', error);
            alert('Failed to generate tweets');
            throw error;
        }
    };

    // Update tweets list
    const updateTweetsList = async () => {
        try {
            const response = await fetch('/api/tweets');
            const tweets = await response.json();

            tweetsGrid.innerHTML = tweets.map(tweet => `
                <div class="card" data-tweet-id="${tweet.id}">
                    <h3>Tweet ${tweet.id}</h3>
                    <p>${tweet.content}</p>
                    <p>Status: ${tweet.status}</p>
                    <button class="schedule-tweet-btn">Schedule</button>
                    <button class="post-tweet-btn">Post Now</button>
                    <button class="view-stats-btn">View Stats</button>
                </div>
            `).join('');

            // Add event listeners for tweet actions
            tweetsGrid.querySelectorAll('.schedule-tweet-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const tweetId = card.dataset.tweetId;
                    await scheduleTweet(tweetId);
                });
            });

            tweetsGrid.querySelectorAll('.post-tweet-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const tweetId = card.dataset.tweetId;
                    await postTweet(tweetId);
                });
            });

            tweetsGrid.querySelectorAll('.view-stats-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const tweetId = card.dataset.tweetId;
                    await viewStats(tweetId);
                });
            });
        } catch (error) {
            console.error('Error fetching tweets:', error);
        }
    };

    // Schedule tweet
    const scheduleTweet = async (tweetId) => {
        const scheduledAt = new Date();
        scheduledAt.setMinutes(scheduledAt.getMinutes() + 10);

        try {
            const response = await fetch('/api/tweets/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tweetId, scheduledAt: scheduledAt.toISOString() })
            });

            if (response.ok) {
                updateTweetsList();
                alert('Tweet scheduled successfully!');
            } else {
                throw new Error('Failed to schedule tweet');
            }
        } catch (error) {
            console.error('Error scheduling tweet:', error);
            alert('Failed to schedule tweet');
        }
    };

    // Post tweet immediately
    const postTweet = async (tweetId) => {
        try {
            const response = await fetch(`/api/tweets/${tweetId}/post`, {
                method: 'POST'
            });

            if (response.ok) {
                updateTweetsList();
                alert('Tweet posted successfully!');
            } else {
                throw new Error('Failed to post tweet');
            }
        } catch (error) {
            console.error('Error posting tweet:', error);
            alert('Failed to post tweet');
        }
    };

    // View tweet stats
    const viewStats = async (tweetId) => {
        try {
            const response = await fetch(`/api/tweets/${tweetId}/stats`);
            const stats = await response.json();

            statsGrid.innerHTML = `
                <div class="card">
                    <h3>Tweet Statistics</h3>
                    <p>Likes: ${stats.like_count}</p>
                    <p>Retweets: ${stats.retweet_count}</p>
                    <p>Replies: ${stats.reply_count}</p>
                    <p>Quotes: ${stats.quote_count}</p>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching tweet stats:', error);
            alert('Failed to fetch tweet statistics');
        }
    };

    // Delete document
    const deleteDocument = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                updateDocumentsList();
                alert('Document deleted successfully!');
            } else {
                throw new Error('Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        }
    };

    // Initial data loading
    updateDocumentsList();
    updateTweetsList();
});
