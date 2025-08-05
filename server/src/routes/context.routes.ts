import { Router, Request, Response } from 'express';
import { contextController } from '../controllers/context.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createContextSchema } from '../utils/validation.utils';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /contexts:
 *   get:
 *     summary: List user contexts
 *     description: Get all contexts for the authenticated user with optional filtering
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [document, text, url]
 *         description: Filter by context type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of items to return
 *     responses:
 *       200:
 *         description: List of contexts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Context'
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => contextController.getAll(req as any, res));

/**
 * @swagger
 * /contexts:
 *   post:
 *     summary: Create a new context
 *     description: Create a new context with the provided data
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Marketing Strategy Q3 2023"
 *                 description: Context title
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "This document outlines our marketing strategy for Q3 2023..."
 *                 description: The main content of the context
 *               type:
 *                 type: string
 *                 enum: [document, text, url]
 *                 default: "text"
 *                 description: Type of context
 *               topic:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Digital Marketing"
 *                 description: Optional topic or subject
 *               brief:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Summary of our Q3 marketing initiatives"
 *                 description: Short summary or description
 *               source:
 *                 type: string
 *                 maxLength: 500
 *                 example: "https://example.com/marketing-strategy"
 *                 description: Source URL or reference
 *               mimetype:
 *                 type: string
 *                 example: "text/plain"
 *                 description: MIME type of the content if applicable
 *               size:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1024
 *                 description: Size in bytes if applicable
 *     responses:
 *       201:
 *         description: Context created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Context'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateRequest(createContextSchema), (req, res) => contextController.create(req as any, res));

/**
 * @swagger
 * /contexts/{id}:
 *   get:
 *     summary: Get context by ID
 *     description: Get a single context by its ID
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the context to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Context found and returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Context'
 *       400:
 *         description: Invalid context ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user doesn't own this context
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Context not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id(\\d+)', (req: Request, res: Response) => contextController.getById(req as any, res));

/**
 * @swagger
 * /contexts/{id}:
 *   put:
 *     summary: Update context
 *     description: Update an existing context
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the context to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Marketing Strategy Q3 2023"
 *                 description: Context title
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: "This document outlines our marketing strategy for Q3 2023..."
 *                 description: The main content of the context
 *               type:
 *                 type: string
 *                 enum: [document, text, url]
 *                 default: "text"
 *                 description: Type of context
 *               topic:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Digital Marketing"
 *                 description: Optional topic or subject
 *               brief:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Summary of our Q3 marketing initiatives"
 *                 description: Short summary or description
 *               source:
 *                 type: string
 *                 maxLength: 500
 *                 example: "https://example.com/marketing-strategy"
 *                 description: Source URL or reference
 *               mimetype:
 *                 type: string
 *                 example: "text/plain"
 *                 description: MIME type of the content if applicable
 *               size:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1024
 *                 description: Size in bytes if applicable
 *     responses:
 *       200:
 *         description: Context updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Context'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user doesn't own this context
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Context not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', (req, res) => contextController.update(req as any, res));

/**
 * @swagger
 * /contexts/{id}:
 *   delete:
 *     summary: Delete context
 *     description: Delete a context by ID
 *     tags: [Contexts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Numeric ID of the context to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Context deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - user doesn't own this context
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Context not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', (req, res) => contextController.delete(req as any, res));

export { router as contextRoutes }; 