import { logger } from '../utils/logger.utils';
import { config } from '../config/environment';
import { postService } from '../services/post.service';

let cron: typeof import('node-cron') | null = null;
let worker: any | null = null;
let devCronStarted = false;
let isDevTickRunning = false;

const QUEUE_NAME = 'scheduled-posts';

export async function initPostScheduler() {
  const env = config.environment;
  try {
    if (env === 'production') {
      // Initialize BullMQ queue and worker with config.redis connection
      const { Queue, Worker } = await import('bullmq');
      const connection = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
      } as any;

      const queue = new Queue(QUEUE_NAME, { connection });

      // Worker handles two job types: 'publish-post' and 'scan-scheduled'
      worker = new Worker(
        QUEUE_NAME,
        async (job: any) => {
          try {
            if (job.name === 'publish-post') {
              const { postId, userId, socialAccountId } = job.data as { postId: number; userId: string; socialAccountId?: number };
              await postService.publishPost(postId, userId, socialAccountId);
              return;
            }

            // Default: periodic scan for due posts
            const due = await postService.getScheduledPosts();
            for (const p of due) {
              try {
                // Note: p now contains post_account_id and social_account_id from the new schema
                await postService.publishPost(p.id, p.user_id, p.social_account_id);
              } catch (e) {
                logger.error('Worker failed to publish post', { postId: p.id, postAccountId: p.post_account_id, error: e });
              }
            }
          } catch (e) {
            logger.error('Worker task failed', e);
            throw e;
          }
        },
        { connection }
      );

      worker.on?.('failed', (job: any, err: any) => {
        logger.error('BullMQ job failed', { jobId: job?.id, err });
      });

      // Add a repeatable job to trigger the worker every minute
      await queue.add(
        'scan-scheduled',
        {},
        { repeat: { pattern: '* * * * *' }, jobId: 'scan-scheduled-repeat' }
      );

      logger.info('BullMQ scheduler initialized with repeatable scan');
    } else {
      // Development/test: poll with node-cron every minute
      cron = await import('node-cron');
      if (!devCronStarted && cron?.schedule) {
        cron.schedule('* * * * *', async () => {
          if (isDevTickRunning) return;
          isDevTickRunning = true;
          try {
            const due = await postService.getScheduledPosts();
            if (due.length) {
              logger.info('Dev scheduler found due posts', { count: due.length });
            }
            for (const p of due) {
              try {
                // Note: p now contains post_account_id and social_account_id from the new schema
                await postService.publishPost(p.id, p.user_id, p.social_account_id);
              } catch (e) {
                logger.error('Dev scheduler failed to publish post', { postId: p.id, postAccountId: p.post_account_id, error: e });
              }
            }
          } catch (e) {
            logger.error('Dev scheduler tick failed', e);
          } finally {
            isDevTickRunning = false;
          }
        });
        devCronStarted = true;
        logger.info('Development cron scheduler started (*/1 * * * *)');
      }
    }
  } catch (error) {
    logger.error('Failed to initialize post scheduler', error);
  }
}

// Optional API to enqueue a single post publish in production (not required when using repeat scan)
export async function enqueueScheduledPost(postId: number, userId: string, scheduledFor: Date, socialAccountId?: number) {
  const env = config.environment;
  if (env !== 'production') return; // dev cron will pick it up
  try {
    const { Queue } = await import('bullmq');
    const connection = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
    } as any;
    const queue = new Queue(QUEUE_NAME, { connection });

    const delayMs = Math.max(0, scheduledFor.getTime() - Date.now());
    const jobId = socialAccountId ? `post-${postId}-account-${socialAccountId}` : `post-${postId}`; // idempotent per account
    await queue.add('publish-post', { postId, userId, socialAccountId }, { delay: delayMs, jobId });
    logger.info('Enqueued scheduled post', { postId, socialAccountId, delayMs });
  } catch (error) {
    logger.error('Failed to enqueue scheduled post', { postId, socialAccountId, error });
  }
}
