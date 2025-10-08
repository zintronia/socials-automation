import { Router } from 'express';
import { platformController } from '../controllers/platform.controller';

const router = Router();

/**
 * @swagger
 * /platforms:
 *   get:
 *     summary: List all available platforms
 *     description: Get all available social media platforms with their capabilities and constraints
 *     tags: [Platforms]
 *     parameters:
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by platform type
 *       - in: query
 *         name: supports_media
 *         schema:
 *           type: boolean
 *         description: Filter by media support
 *     responses:
 *       200:
 *         description: List of platforms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Platforms retrieved successfully"
 *               data: [
 *                 {
 *                   id: 1,
 *                   name: "LinkedIn",
 *                   type: "professional",
 *                   icon_url: "https://example.com/linkedin-icon.png",
 *                   is_active: true,
 *                   max_content_length: 3000,
 *                   supports_media: true,
 *                   supported_media_types: ["image/jpeg", "image/png", "video/mp4"],
 *                   platform_constraints: {
 *                     hashtag_limit: 30,
 *                     mention_limit: 50
 *                   },
 *                   created_at: "2024-01-01T00:00:00.000Z",
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *                 },
 *                 {
 *                   id: 2,
 *                   name: "Twitter",
 *                   type: "social",
 *                   icon_url: "https://example.com/twitter-icon.png",
 *                   is_active: true,
 *                   max_content_length: 280,
 *                   supports_media: true,
 *                   supported_media_types: ["image/jpeg", "image/png", "image/gif", "video/mp4"],
 *                   platform_constraints: {
 *                     hashtag_limit: 10,
 *                     mention_limit: 20
 *                   },
 *                   created_at: "2024-01-01T00:00:00.000Z",
 *                   updated_at: "2024-01-01T00:00:00.000Z"
 *                 }
 *               ]
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res) => platformController.getAll(req as any, res));

/**
 * @swagger
 * /platforms/{id}:
 *   get:
 *     summary: Get platform details
 *     description: Retrieve detailed information about a specific platform
 *     tags: [Platforms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Platform ID
 *     responses:
 *       200:
 *         description: Platform details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Platform details retrieved successfully"
 *               data: {
 *                 id: 1,
 *                 name: "LinkedIn",
 *                 type: "professional",
 *                 icon_url: "https://example.com/linkedin-icon.png",
 *                 is_active: true,
 *                 max_content_length: 3000,
 *                 supports_media: true,
 *                 supported_media_types: ["image/jpeg", "image/png", "video/mp4"],
 *                 platform_constraints: {
 *                   hashtag_limit: 30,
 *                   mention_limit: 50,
 *                   character_limit: 3000,
 *                   media_limit: 9
 *                 },
 *                 created_at: "2024-01-01T00:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Platform not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Platform not found"
 *               error: "PLATFORM_NOT_FOUND"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req, res) => platformController.getById(req as any, res));

export { router as platformRoutes }; 