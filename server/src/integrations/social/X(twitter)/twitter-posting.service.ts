import { TwitterApi } from 'twitter-api-v2';
import { oauth2TwitterService } from './oauth2-twitter.service';
import { logger } from '../../../utils/logger.utils';

export interface TweetMedia {
    media_data?: Buffer;
    media_url?: string;
    type: 'image' | 'video' | 'gif';
    alt_text?: string;
}

export interface TweetOptions {
    replyToTweetId?: string;
    mediaIds?: string[];
    pollOptions?: string[];
    pollDurationMinutes?: number;
    quoteTweetId?: string;
    placeId?: string;
    forSuperFollowersOnly?: boolean;
}

export interface TweetThreadItem {
    text: string;
    media?: TweetMedia[];
    options?: Omit<TweetOptions, 'replyToTweetId'>;
}

export class TwitterPostingService {
    /**
     * Post a simple text tweet
     */
    async postTweet(
        accountId: string,
        text: string,
        options: TweetOptions = {}
    ): Promise<{ id: string; url: string }> {
        try {
            const accessToken = await oauth2TwitterService.getAccessToken(accountId);
            const client = new TwitterApi(accessToken);

            const tweetData: any = {
                text: this.truncateText(text, 280)
            };

            if (options.mediaIds?.length) {
                tweetData.media = { media_ids: options.mediaIds };
            }

            if (options.replyToTweetId) {
                tweetData.reply = { in_reply_to_tweet_id: options.replyToTweetId };
            }

            if (options.quoteTweetId) {
                tweetData.quote_tweet_id = options.quoteTweetId;
            }

            const tweet = await client.v2.tweet(tweetData);

            logger.info(`Posted tweet for account ${accountId}`, { tweetId: tweet.data.id });

            return {
                id: tweet.data.id,
                url: `https://twitter.com/i/web/status/${tweet.data.id}`
            };
        } catch (error) {
            logger.error('Error posting tweet:', error);
            throw new Error('Failed to post tweet');
        }
    }

    /**
     * Upload media to Twitter
     */
    async uploadMedia(
        accountId: string,
        media: TweetMedia
    ): Promise<{ mediaId: string; size: number; expiresAfterSecs: number }> {
        try {
            const accessToken = await oauth2TwitterService.getAccessToken(accountId);
            const client = new TwitterApi(accessToken);

            // If media_url is provided, download the media first
            let mediaBuffer: Buffer;
            if (media.media_url) {
                throw new Error('Media URL download not implemented');
            } else if (media.media_data) {
                mediaBuffer = media.media_data;
            } else {
                throw new Error('Either media_data or media_url must be provided');
            }

            // Upload media
            const mediaId = await client.v1.uploadMedia(mediaBuffer, {
                mimeType: this.getMimeType(media.type),
                target: 'tweet',
                // media_category: this.getMediaCategory(media.type)
            });

            // Add alt text if provided
            if (media.alt_text) {
                await client.v1.createMediaMetadata(mediaId, {
                    alt_text: { text: media.alt_text }
                });
            }

            return {
                mediaId,
                size: mediaBuffer.length,
                expiresAfterSecs: 86400 // 24 hours
            };
        } catch (error) {
            logger.error('Error uploading media to Twitter:', error);
            throw new Error('Failed to upload media to Twitter');
        }
    }

    /**
     * Post a thread of tweets
     */
    async postThread(
        accountId: string,
        thread: TweetThreadItem[]
    ): Promise<Array<{ id: string; url: string }>> {
        if (thread.length === 0) {
            throw new Error('Thread must contain at least one tweet');
        }

        const results = [];
        let previousTweetId: string | undefined;

        for (const [index, tweet] of thread.entries()) {
            try {
                // Upload media if present
                let mediaIds: string[] = [];
                if (tweet.media?.length) {
                    for (const mediaItem of tweet.media) {
                        const { mediaId } = await this.uploadMedia(accountId, mediaItem);
                        mediaIds.push(mediaId);
                    }
                }

                // Post the tweet
                const result = await this.postTweet(accountId, tweet.text, {
                    ...tweet.options,
                    replyToTweetId: index > 0 ? previousTweetId : undefined,
                    mediaIds: mediaIds.length ? mediaIds : undefined
                });

                previousTweetId = result.id;
                results.push(result);

                // Small delay between tweets in the thread
                if (index < thread.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                logger.error(`Error posting tweet ${index + 1} in thread:`, error);
                throw new Error(`Failed to post tweet ${index + 1} in thread`);
            }
        }

        return results;
    }

    /**
     * Delete a tweet
     */
    async deleteTweet(accountId: string, tweetId: string): Promise<boolean> {
        try {
            const accessToken = await oauth2TwitterService.getAccessToken(accountId);
            const client = new TwitterApi(accessToken);

            await client.v2.deleteTweet(tweetId);
            logger.info(`Deleted tweet ${tweetId} for account ${accountId}`);

            return true;
        } catch (error) {
            logger.error('Error deleting tweet:', error);
            throw new Error('Failed to delete tweet');
        }
    }

    /**
     * Schedule a tweet to be posted later
     */
    async scheduleTweet(
        accountId: string,
        text: string,
        scheduledTime: Date,
        options: TweetOptions = {}
    ): Promise<{ id: string; scheduledTime: string }> {
        // Note: Twitter doesn't have a native scheduling API,
        // so this would be implemented using your job queue system
        // This is a placeholder implementation

        // You would typically:
        // 1. Store the scheduled tweet in your database
        // 2. Set up a job to be executed at the scheduled time
        // 3. The job would then call postTweet()

        throw new Error('Scheduled tweets not yet implemented');
    }

    // Helper methods
    private truncateText(text: string, maxLength: number): string {
        return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
    }

    private getMimeType(mediaType: 'image' | 'video' | 'gif'): string {
        switch (mediaType) {
            case 'image':
                return 'image/jpeg';
            case 'video':
                return 'video/mp4';
            case 'gif':
                return 'image/gif';
            default:
                return 'application/octet-stream';
        }
    }

    private getMediaCategory(mediaType: 'image' | 'video' | 'gif'): string {
        switch (mediaType) {
            case 'image':
                return 'tweet_image';
            case 'video':
                return 'tweet_video';
            case 'gif':
                return 'tweet_gif';
            default:
                return 'tweet';
        }
    }
}

export const twitterPostingService = new TwitterPostingService();
