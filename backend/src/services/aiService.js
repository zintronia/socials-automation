const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY, {
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1'
});

const aiService = {
  async generateTweet(content) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Generate an engaging tweet from the following content:
        ${content}
        
        Requirements:
        1. Keep it under 280 characters
        2. Make it engaging and shareable
        3. Include relevant hashtags
        4. Avoid using special characters that might break Twitter formatting
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response and ensure it's under 280 characters
      const cleanedTweet = text.trim().substring(0, 277) + (text.length > 277 ? '...' : '');
      return cleanedTweet;
    } catch (error) {
      console.error('Error generating tweet:', error);
      // Add more detailed error logging
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  },
  async generateVariations(content, count = 3) {
    try {
      // Check if content is empty or too short
      if (!content || content.trim().length < 50) {
        throw new Error('Document content is too short or empty to generate tweets');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Generate ${count} different tweet variations from the following content:
        ${content}
        
        For each tweet, please:
        - Focus on key aspects of the business and its offerings
        - Include relevant hashtags based on the content
        - Add a call-to-action if appropriate
        - Keep it under 280 characters
        - Make it engaging and shareable
        - Use proper grammar and punctuation
        - Format numbers and statistics clearly
        - Avoid generic templates or placeholders
        - Create unique, specific tweets that highlight the business value
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Check if response is empty
      if (!text || text.trim().length < 50) {
        throw new Error('AI service returned empty or very short response');
      }

      let tweets;
      try {
        tweets = JSON.parse(text);
      } catch (e) {
        // Split by lines and filter out empty or template-like lines
        const tweetLines = text.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && 
                 !trimmed.startsWith('Tweet') && 
                 !trimmed.startsWith('Status:') && 
                 !trimmed.startsWith('-') && 
                 !trimmed.startsWith('1.') && 
                 !trimmed.startsWith('2.') && 
                 !trimmed.startsWith('3.') &&
                 trimmed.length > 20; // Minimum length to avoid placeholders
        });
        
        if (tweetLines.length < count) {
          throw new Error(`Not enough valid tweets generated. Expected ${count}, got ${tweetLines.length}`);
        }

        tweets = tweetLines.map(tweet => ({
          tweet: tweet.trim().substring(0, 277) + (tweet.length > 277 ? '...' : ''),
          keywords: [],
          sentiment: 'neutral'
        }));
      }

      // Validate and clean each tweet
      const validTweets = [];
      const seenTweets = new Set();
      
      for (const tweet of tweets) {
        try {
          // Clean the tweet text
          let cleanedTweet = tweet.tweet.trim();
          
          // Remove common introductory phrases and template patterns
          const introPatterns = [
            /^here (?:are|is) (?:the )?(?:tweet|post|content)(?: variations)?/i,
            /^(?:tweet|post|content) (?:about|for|highlighting):?/i,
            /^here (?:are|is) (?:some|the) (?:generated )?(?:tweets|posts|content):?/i
          ];
          
          // Apply each pattern until one matches
          for (const pattern of introPatterns) {
            if (pattern.test(cleanedTweet)) {
              cleanedTweet = cleanedTweet.replace(pattern, '').trim();
              break;
            }
          }
          
          // Apply additional cleaning
          cleanedTweet = cleanedTweet
            .replace(/^[\*\-\d\.\s]+/gm, '') // Remove markdown list indicators
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
            .replace(/[^\w\s#@.,!?&%$\-:;'"\n]/g, '') // Allow common punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          // Skip if tweet is too short after cleaning
          if (cleanedTweet.length < 30) {
            console.warn('Skipping tweet - too short after cleaning:', cleanedTweet);
            continue;
          }
          
          // Skip if tweet contains template-like patterns (case insensitive)
          const lowerTweet = cleanedTweet.toLowerCase();
          const templatePatterns = [
            'tweet:', 'status:', 'focus:', 'example:', 'note:', 'variation',
            'here are', 'here is', 'content:', 'post:', 'highlighting',
            'this is a tweet', 'sample tweet', 'tweet example', 'tweet about'
          ];
          
          if (templatePatterns.some(pattern => lowerTweet.includes(pattern))) {
            console.warn('Skipping tweet - contains template patterns:', cleanedTweet);
            continue;
          }
          
          // Skip duplicate or very similar tweets
          const tweetHash = cleanedTweet.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (seenTweets.has(tweetHash)) {
            console.warn('Skipping duplicate tweet:', cleanedTweet);
            continue;
          }
          seenTweets.add(tweetHash);
          
          validTweets.push({
            tweet: cleanedTweet.substring(0, 277) + (cleanedTweet.length > 277 ? '...' : ''),
            keywords: tweet.keywords || [],
            sentiment: tweet.sentiment || 'neutral'
          });
          
          // Stop if we have enough valid tweets
          if (validTweets.length >= count) break;
          
        } catch (err) {
          console.warn('Error processing tweet, skipping:', err.message);
          continue;
        }
      }
      
      // If we couldn't generate enough valid tweets, log a warning but return what we have
      if (validTweets.length < count) {
        console.warn(`Only generated ${validTweets.length} valid tweets out of requested ${count}`);
      }
      
      return validTweets;
    } catch (error) {
      console.error('Error generating tweet variations:', error);
      throw error;
    }
  }
};

module.exports = aiService;
