const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY, {
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1'
});

const linkedinAIService = {
  /**
   * Generates LinkedIn post content from the provided document content
   * @param {string} content - The document content to generate post from
   * @returns {Promise<string>} - Generated LinkedIn post
   */
  async generatePost(content) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Generate a professional LinkedIn post from the following content:
        ${content}
        
        Requirements:
        1. Keep it between 300-1000 characters
        2. Use a professional yet engaging tone
        3. Structure with 3-5 short paragraphs
        4. Include relevant hashtags (2-5) at the end
        5. Add a call-to-action or question to encourage engagement
        6. Format for LinkedIn (use line breaks between paragraphs)
        7. Avoid special characters that might break formatting
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error generating LinkedIn post:', error);
      throw new Error('Failed to generate LinkedIn content');
    }
  },

  /**
   * Generates multiple variations of LinkedIn posts
   * @param {string} content - The document content to generate posts from
   * @param {number} count - Number of variations to generate (default: 3)
   * @returns {Promise<Array>} - Array of generated post variations
   */
  async generatePostVariations(content, count = 3) {
    try {
      if (!content || content.trim().length < 100) {
        throw new Error('Document content is too short or empty to generate LinkedIn posts');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Generate ${count} different LinkedIn post variations from the following content.
        Each post should be unique in style and approach but based on the same content.
        
        Content:
        ${content}
        
        For each variation, follow these guidelines:
        1. Length: 300-1000 characters
        2. Tone: Professional but engaging
        3. Structure: 3-5 short paragraphs
        4. Include 2-5 relevant hashtags at the end
        5. Add a call-to-action or question
        6. Format with line breaks between paragraphs
        
        Return the variations as a JSON array of objects with this structure:
        [
          {
            "content": "Full post content...",
            "summary": "Brief summary of the post's angle",
            "style": "e.g., Storytelling, Data-driven, Thought leadership"
          },
          ...
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let variations;
      
      try {
        // Try to parse as JSON first
        variations = JSON.parse(response.text().trim());
      } catch (e) {
        // Fallback to plain text parsing if JSON parsing fails
        console.warn('Failed to parse response as JSON, falling back to text parsing');
        const text = response.text().trim();
        variations = text.split('\n\n').filter(v => v.trim().length > 0)
          .map((v, i) => ({
            content: v,
            summary: `Variation ${i + 1}`,
            style: 'Generated content'
          }));
      }
      
      // Ensure we return an array with the requested number of items
      return Array.isArray(variations) 
        ? variations.slice(0, count)
        : [];
    } catch (error) {
      console.error('Error generating LinkedIn post variations:', error);
      throw new Error('Failed to generate LinkedIn post variations');
    }
  },

  /**
   * Generates a comment for a LinkedIn post
   * @param {string} postContent - The original post content
   * @param {string} context - Additional context for the comment
   * @returns {Promise<string>} - Generated comment
   */
  async generateComment(postContent, context = '') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        Generate a thoughtful and engaging LinkedIn comment for the following post.
        ${context ? `Context: ${context}\n\n` : ''}
        Post:
        ${postContent}
        
        Requirements:
        1. Keep it under 600 characters
        2. Be professional and add value to the conversation
        3. Include 1-2 relevant hashtags if appropriate
        4. Ask a question or add an insight to encourage discussion
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text().trim();
    } catch (error) {
      console.error('Error generating LinkedIn comment:', error);
      throw new Error('Failed to generate LinkedIn comment');
    }
  }
};

module.exports = linkedinAIService;
