import { Router, Request, Response } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { generatePostSchema, updatePostSchema } from '../utils/validation.utils';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: List user posts
 *     description: Get all posts for the authenticated user with optional filtering
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, published, failed]
 *         description: Filter by post status
 *       - in: query
 *         name: platform_id
 *         schema:
 *           type: integer
 *         description: Filter by platform ID
 *       - in: query
 *         name: context_id
 *         schema:
 *           type: integer
 *         description: Filter by context ID
 *       - in: query
 *         name: campaign_id
 *         schema:
 *           type: integer
 *         description: Filter by collection ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in content
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, scheduled_for, published_at]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               message: "Posts retrieved successfully"
 *               data: [
 *                 {
 *                   id: 1,
 *                   user_id: 1,
 *                   context_id: 1,
 *                   platform_id: 1,
 *                   content: "Exciting news! We've just launched our new product...",
 *                   content_type: "text",
 *                   hashtags: ["#innovation", "#productlaunch"],
 *                   mentions: ["@techcorp"],
 *                   status: "scheduled",
 *                   scheduled_for: "2024-01-01T10:00:00.000Z",
 *                   created_at: "2024-01-01T00:00:00.000Z",
 *                   updated_at: "2024-01-01T00:00:00.000Z",
 *                   context_title: "Product Launch Announcement",
 *                   platform_name: "LinkedIn",
 *                   user_email: "user@example.com"
 *                 }
 *               ]
 *               pagination: {
 *                 page: 1,
 *                 limit: 10,
 *                 total: 25,
 *                 totalPages: 3,
 *                 hasNext: true,
 *                 hasPrev: false
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res) => postController.getAll(req as any, res));

/**
 * @swagger
 * /posts/generate:
 *   post:
 *     summary: Generate post from context
 *     description: Generate a new post using AI based on context and template
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePostRequest'
 *           example:
 *             context_id: 1
 *             platform_id: 1
 *             scheduled_for: "2024-01-01T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Post generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post generated successfully"
 *               data: {
 *                 id: 1,
 *                 user_id: 1,
 *                 context_id: 1,
 *                 platform_id: 1,
 *                 content: "Exciting news! We've just launched our new product...",
 *                 content_type: "text",
 *                 hashtags: ["#innovation", "#productlaunch"],
 *                 mentions: [],
 *                 status: "draft",
 *                 scheduled_for: "2024-01-01T10:00:00.000Z",
 *                 created_at: "2024-01-01T00:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error or generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Context or platform not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate', validateRequest(generatePostSchema), (req, res) => postController.generatePost(req as any, res));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post details
 *     description: Retrieve a specific post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post retrieved successfully"
 *               data: {
 *                 id: 1,
 *                 user_id: 1,
 *                 context_id: 1,
 *                 platform_id: 1,
 *                 content: "Exciting news! We've just launched our new product...",
 *                 content_type: "text",
 *                 hashtags: ["#innovation", "#productlaunch"],
 *                 mentions: ["@techcorp"],
 *                 status: "scheduled",
 *                 scheduled_for: "2024-01-01T10:00:00.000Z",
 *                 platform_post_id: "123456789",
 *                 platform_url: "https://linkedin.com/posts/123456789",
 *                 engagement_metrics: {
 *                   likes: 25,
 *                   comments: 5,
 *                   shares: 3
 *                 },
 *                 created_at: "2024-01-01T00:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z",
 *                 context_title: "Product Launch Announcement",
 *                 platform_name: "LinkedIn",
 *                 user_email: "user@example.com"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req, res) => postController.getById(req as any, res));

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update post content
 *     description: Update an existing post's content and metadata
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Post hashtags
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Post mentions
 *               scheduled_for:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled publication time
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *           example:
 *             content: "Updated post content with new information..."
 *             hashtags: ["#updated", "#newinfo"]
 *             scheduled_for: "2024-01-01T12:00:00.000Z"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validateRequest(updatePostSchema), (req, res) => postController.update(req as any, res));

/**
 * @swagger
 * /posts/{id}/schedule:
 *   post:
 *     summary: Schedule post
 *     description: Schedule a post for future publication
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [scheduled_for]
 *             properties:
 *               scheduled_for:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled publication time
 *           example:
 *             scheduled_for: "2024-01-01T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: Post scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post scheduled successfully"
 *               data: {
 *                 id: 1,
 *                 status: "scheduled",
 *                 scheduled_for: "2024-01-01T10:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error or scheduling failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/schedule', (req, res) => postController.schedule(req as any, res));

/**
 * @swagger
 * /posts/{id}/publish:
 *   post:
 *     summary: Publish post immediately
 *     description: Publish a post immediately to the platform
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post published successfully"
 *               data: {
 *                 id: 1,
 *                 status: "published",
 *                 published_at: "2024-01-01T00:00:00.000Z",
 *                 platform_post_id: "123456789",
 *                 platform_url: "https://linkedin.com/posts/123456789",
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Publishing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/publish', (req, res) => postController.publish(req as any, res));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete post
 *     description: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Post deleted successfully"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', (req, res) => postController.delete(req as any, res));

export { router as postRoutes }; 