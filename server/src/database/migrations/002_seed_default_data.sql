
-- Insert content categories
INSERT INTO content_categories (id, name, description) VALUES 
(1, 'promotional', 'Marketing and promotional content'),
(2, 'educational', 'Educational and informative content'),
(3, 'engagement', 'Content designed to increase engagement'),
(4, 'entertainment', 'Fun and entertaining content'),
(5, 'news', 'News and updates'),
(6, 'personal', 'Personal stories and experiences')
ON CONFLICT (id) DO NOTHING;

-- Insert platforms
INSERT INTO platforms (id, name, type, max_content_length, supports_media, supported_media_types, platform_constraints) VALUES 
(1, 'Twitter', 'social', 280, true, ARRAY['image', 'video', 'gif'], '{"max_images": 4, "max_video_duration": 140, "thread_support": true}'),
(2, 'LinkedIn', 'social', 3000, true, ARRAY['image', 'video', 'document'], '{"max_images": 20, "professional_tone_preferred": true, "article_support": true}'),
(3, 'Instagram', 'social', 2200, true, ARRAY['image', 'video'], '{"requires_visual": true, "max_hashtags": 30, "story_support": true}'),
(4, 'Facebook', 'social', 63206, true, ARRAY['image', 'video', 'gif'], '{"max_images": 10, "event_support": true}'),
(5, 'TikTok', 'social', 150, true, ARRAY['video'], '{"requires_video": true, "max_duration": 180}')
ON CONFLICT (id) DO NOTHING;

-- System Templates - One per platform
INSERT INTO context_templates (
  user_id, platform_id, category_id, name, description,
  system_instructions, tone, writing_style, target_audience,
  use_hashtags, max_hashtags, hashtag_strategy, include_cta, cta_type,
  content_structure, engagement_level, call_to_action_templates,
  is_default, is_public, is_system_template, is_active
) VALUES

-- Twitter Template
(NULL, 1, 1,  'Twitter Default', 'General purpose Twitter content template',
'Create engaging tweets that drive action. Keep content concise under 280 characters. Use emojis strategically and include relevant hashtags.',
'conversational', 'casual', 'general_audience',
true, 5, 'trending', true, 'engagement',
'{"structure": ["hook", "content", "cta"], "max_length": 280, "emoji_usage": "moderate"}',
 'high',
ARRAY['Check it out:', 'Learn more:', 'What do you think?', 'Share your thoughts:'],
true, true, true, true),

-- LinkedIn Template  
(NULL, 2, 1,  'LinkedIn Default', 'Professional content template for LinkedIn',
'Create professional LinkedIn posts that provide value to your network. Use a professional tone while being engaging and informative.',
'professional', 'informative', 'professionals',
true, 5, 'industry', true, 'engagement', 
'{"structure": ["insight", "explanation", "discussion"], "professional_tone": true, "value_focused": true}',
 'medium',
ARRAY['Key insight:', 'What are your thoughts?', 'Share your experience:', 'Connect with me:'],
true, true, true, true),

-- Instagram Template
(NULL, 3, 1,'Instagram Default', 'Visual storytelling template for Instagram',
'Create Instagram posts that tell a visual story. Focus on aesthetics, lifestyle content, and authentic moments that resonate with followers.',
'authentic', 'visual_storytelling', 'lifestyle_enthusiasts',
true, 15, 'lifestyle', true, 'engagement',
'{"structure": ["visual_hook", "story", "engagement"], "visual_focus": true, "authentic": true}',
 'high',
ARRAY['Drop a heart if you agree', 'Share your story below', 'Tag someone who needs this', 'Save for later'],
true, true, true, true),

-- Facebook Template
(NULL, 4, 1, 'Facebook Default', 'Community engagement template for Facebook',
'Create Facebook posts that build community and encourage discussion. Focus on relatable content that brings people together.',
'friendly', 'community_focused', 'community_members',
true, 8, 'community', true, 'engagement',
'{"structure": ["community_focus", "shared_experience", "discussion"], "community_building": true}',
 'high',
ARRAY['What do you think?', 'Share your experience:', 'Tag a friend:', 'Join the discussion:'],
true, true, true, true),

-- TikTok Template
(NULL, 5, 1, 'TikTok Default', 'Trending entertainment template for TikTok', 
'Create TikTok content that entertains and follows current trends. Focus on viral potential while staying authentic to your brand.',
'energetic', 'entertaining', 'gen_z_millennials',
true, 5, 'trending', true, 'follow',
'{"structure": ["hook", "entertainment", "call_to_action"], "viral_potential": true, "trend_aware": true}',
 'high',
ARRAY['Follow for more', 'Try this trend', 'Your turn', 'Comment below'],
true, true, true, true),

-- Additional Templates - Multiple per platform

-- More Twitter Templates
(NULL, 1, 1, 'Twitter Educational', 'Educational thread template for Twitter',
'Create educational Twitter threads that break down complex topics. Use numbered points and clear explanations.',
'informative', 'educational', 'learners',
true, 3, 'educational', true, 'engagement',
'{"structure": ["thread_hook", "numbered_points", "summary"], "thread_format": true}',
 'medium',
ARRAY['Thread breakdown:', 'Key takeaway:', 'What do you think?', 'Retweet if helpful:'],
false, true, true, true),

(NULL, 1, 1, 'Twitter Personal', 'Personal story template for Twitter',
'Share authentic personal experiences and lessons learned. Be relatable and genuine.',
'authentic', 'personal', 'followers',
true, 4, 'personal', true, 'engagement',
'{"structure": ["story_setup", "experience", "lesson"], "authentic": true}',
 'medium',
ARRAY['Lesson learned:', 'Personal update:', 'Sharing because:', 'Can you relate?'],
false, true, true, true),

(NULL, 1, 1, 'Twitter News', 'News and updates template for Twitter',
'Share breaking news and timely updates. Keep it factual and immediate.',
'professional', 'newsworthy', 'general_audience',
true, 3, 'trending', false, NULL,
'{"structure": ["headline", "key_facts", "context"], "news_format": true}',
 'medium',
ARRAY['Breaking:', 'Update:', 'Just in:', 'News:'],
false, true, true, true),

-- More LinkedIn Templates
(NULL, 2, 1, 'LinkedIn Promotional', 'Professional promotional content for LinkedIn',
'Create professional promotional content that adds value. Focus on business benefits and professional growth.',
'professional', 'business_focused', 'business_professionals',
true, 5, 'business', true, 'website_visit',
'{"structure": ["value_proposition", "benefits", "call_to_action"], "business_focused": true}',
 'medium',
ARRAY['Learn more:', 'Discover how:', 'Get started:', 'Join us:'],
false, true, true, true),

(NULL, 2, 1, 'LinkedIn Personal Brand', 'Personal branding content for LinkedIn',
'Build your personal brand with authentic professional stories and insights.',
'authentic', 'professional_personal', 'professional_network',
true, 5, 'personal_brand', true, 'connection',
'{"structure": ["personal_story", "professional_insight", "networking"], "personal_brand": true}',
 'medium',
ARRAY['My experience:', 'Key learning:', 'Connect with me:', 'Share your story:'],
false, true, true, true),

(NULL, 2, 1, 'LinkedIn Industry News', 'Industry news and trends for LinkedIn',
'Share industry news with professional commentary and insights.',
'professional', 'analytical', 'industry_professionals',
true, 4, 'industry', true, 'engagement',
'{"structure": ["news_summary", "analysis", "implications"], "industry_focus": true}',
 'medium',
ARRAY['Industry update:', 'Key implications:', 'What this means:', 'Your thoughts?'],
false, true, true, true),

-- More Instagram Templates
(NULL, 3, 1, 'Instagram Promotional', 'Product promotion template for Instagram',
'Create visually appealing promotional content that showcases products or services authentically.',
'aspirational', 'promotional', 'potential_customers',
true, 20, 'product', true, 'website_visit',
'{"structure": ["visual_appeal", "product_benefits", "call_to_action"], "visual_first": true}',
 'high',
ARRAY['Shop now:', 'Link in bio:', 'Get yours today:', 'Limited time offer:'],
false, true, true, true),

(NULL, 3, 1, 'Instagram Educational', 'Educational carousel template for Instagram',
'Create educational content using carousel format. Make learning visual and engaging.',
'educational', 'visual_teaching', 'learners',
true, 12, 'educational', true, 'save_share',
'{"structure": ["title_slide", "educational_content", "summary"], "carousel_format": true}',
 'medium',
ARRAY['Save this post:', 'Swipe to learn:', 'Share with friends:', 'Which tip helps most?'],
false, true, true, true),

(NULL, 3, 1, 'Instagram Behind Scenes', 'Behind the scenes content for Instagram',
'Share authentic behind-the-scenes moments that humanize your brand.',
'authentic', 'candid', 'engaged_followers',
true, 10, 'behind_scenes', true, 'engagement',
'{"structure": ["scene_setting", "process_reveal", "personal_connection"], "authentic": true}',
 'high',
ARRAY['Behind the scenes:', 'Real talk:', 'The process:', 'Ask me anything:'],
false, true, true, true),

-- More Facebook Templates
(NULL, 4, 1,  'Facebook Promotional', 'Community-focused promotion for Facebook',
'Create promotional content that feels natural within community discussions.',
'friendly', 'community_promotional', 'community_members',
true, 8, 'community', true, 'website_visit',
'{"structure": ["community_value", "product_integration", "discussion"], "community_first": true}',
 'medium',
ARRAY['Check this out:', 'Learn more here:', 'Great for our community:', 'What do you think?'],
false, true, true, true),

(NULL, 4, 1, 'Facebook Educational', 'Educational content for Facebook communities',
'Share educational content that sparks discussion and knowledge sharing.',
'informative', 'discussion_focused', 'community_learners',
true, 8, 'educational', true, 'engagement',
'{"structure": ["educational_content", "discussion_prompt", "community_sharing"], "educational": true}',
 'medium',
ARRAY['Did you know:', 'Share your experience:', 'What have you learned:', 'Discuss below:'],
false, true, true, true),

(NULL, 4, 1, 'Facebook News', 'News sharing template for Facebook',
'Share news and updates with community context and discussion prompts.',
'informative', 'community_news', 'community_members',
true, 6, 'news', true, 'engagement',
'{"structure": ["news_summary", "community_relevance", "discussion"], "news_focused": true}',
 'medium',
ARRAY['Important update:', 'What this means for us:', 'Thoughts on this:', 'Share your views:'],
false, true, true, true),

-- More TikTok Templates
(NULL, 5, 1, 'TikTok Educational', 'Quick educational content for TikTok',
'Create short, engaging educational content that teaches something valuable quickly.',
'energetic', 'quick_teaching', 'young_learners',
true, 5, 'educational', true, 'follow',
'{"structure": ["hook", "quick_lesson", "recap"], "educational": true, "quick_format": true}',
 'high',
ARRAY['Follow for tips:', 'Save this:', 'Try this hack:', 'Did you know:'],
false, true, true, true),

(NULL, 5, 1, 'TikTok Promotional', 'Product showcase template for TikTok',
'Showcase products or services in an entertaining, trend-aware way.',
'trendy', 'product_showcase', 'potential_customers',
true, 5, 'product', true, 'website_visit',
'{"structure": ["trend_hook", "product_showcase", "call_to_action"], "product_focused": true}',
 'high',
ARRAY['Link in bio:', 'Get yours:', 'Follow for more:', 'Check comments:'],
false, true, true, true),

(NULL, 5, 1, 'TikTok Personal', 'Personal story template for TikTok',
'Share personal stories and experiences in an entertaining, relatable way.',
'authentic', 'personal_storytelling', 'followers',
true, 5, 'personal', true, 'engagement',
'{"structure": ["story_hook", "personal_experience", "relatable_ending"], "personal": true}',
 'high',
ARRAY['Can you relate?', 'Story time:', 'Personal update:', 'Share yours:'],
false, true, true, true);

-- Reset sequences
SELECT setval('content_categories_id_seq', (SELECT MAX(id) FROM content_categories)); 
SELECT setval('platforms_id_seq', (SELECT MAX(id) FROM platforms));
SELECT setval('context_templates_id_seq', (SELECT MAX(id) FROM context_templates));