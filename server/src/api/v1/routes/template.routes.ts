import { Router, Request, Response } from 'express';
import { templateController } from '../controllers/template.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createTemplateSchema } from '../validation/validation';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: List templates
 *     description: Get all templates (user templates + public templates) with optional filtering
 *     tags: [Templates]
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
 *         name: platform_id
 *         schema:
 *           type: integer
 *         description: Filter by platform ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, name, usage_count]
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
 *         description: List of templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               message: "Templates retrieved successfully"
 *               data: [
 *                 {
 *                   id: 1,
 *                   user_id: null,
 *                   platform_id: 1,
 *                   name: "LinkedIn Professional Post",
 *                   description: "Professional LinkedIn post template",
 *                   system_instructions: "Create a professional LinkedIn post...",
 *                   tone: "professional",
 *                   writing_style: "business",
 *                   target_audience: "B2B professionals",
 *                   is_public: true,
 *                   is_active: true,
 *                   usage_count: 150,
 *                   created_at: "2024-01-01T00:00:00.000Z",
 *                   updated_at: "2024-01-01T00:00:00.000Z",
 *                   platform_name: "LinkedIn",
 *                   category_name: "Professional"
 *                 }
 *               ]
 *               pagination: {
 *                 page: 1,
 *                 limit: 10,
 *                 total: 50,
 *                 totalPages: 5,
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
router.get('/', (req, res) => templateController.getAll(req as any, res));

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Create custom template
 *     description: Create a new custom template for content generation
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplateRequest'
 *           example:
 *             platform_id: 1
 *             name: "My Custom LinkedIn Template"
 *             description: "Custom template for LinkedIn posts"
 *             system_instructions: "Create engaging LinkedIn posts that drive engagement..."
 *             tone: "professional"
 *             writing_style: "conversational"
 *             target_audience: "B2B professionals"
 *             use_hashtags: true
 *             max_hashtags: 5
 *             include_cta: true
 *             cta_type: "website_visit"
 *             is_public: false
 *             variables: [
 *               {
 *                 variable_name: "company_name",
 *                 variable_type: "text",
 *                 is_required: true,
 *                 description: "Company name"
 *               }
 *             ]
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Template created successfully"
 *               data: {
 *                 id: 1,
 *                 user_id: 1,
 *                 platform_id: 1,
 *                 name: "My Custom LinkedIn Template",
 *                 description: "Custom template for LinkedIn posts",
 *                 system_instructions: "Create engaging LinkedIn posts...",
 *                 tone: "professional",
 *                 writing_style: "conversational",
 *                 target_audience: "B2B professionals",
 *                 is_public: false,
 *                 is_active: true,
 *                 created_at: "2024-01-01T00:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z"
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateRequest(createTemplateSchema), (req, res) => templateController.create(req as any, res));

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Get template details
 *     description: Retrieve a specific template by ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Template retrieved successfully"
 *               data: {
 *                 id: 1,
 *                 user_id: 1,
 *                 platform_id: 1,
 *                 name: "My Custom LinkedIn Template",
 *                 description: "Custom template for LinkedIn posts",
 *                 system_instructions: "Create engaging LinkedIn posts...",
 *                 tone: "professional",
 *                 writing_style: "conversational",
 *                 target_audience: "B2B professionals",
 *                 use_hashtags: true,
 *                 max_hashtags: 5,
 *                 include_cta: true,
 *                 cta_type: "website_visit",
 *                 is_public: false,
 *                 is_active: true,
 *                 usage_count: 0,
 *                 created_at: "2024-01-01T00:00:00.000Z",
 *                 updated_at: "2024-01-01T00:00:00.000Z",
 *                 platform_name: "LinkedIn",
 *                 category_name: "Professional",
 *                 variables: [
 *                   {
 *                     variable_name: "company_name",
 *                     variable_type: "text",
 *                     is_required: true,
 *                     description: "Company name"
 *                   }
 *                 ]
 *               }
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
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
router.get('/:id', (req, res) => templateController.getById(req as any, res));

/**
 * @swagger
 * /templates/{id}:
 *   put:
 *     summary: Update template
 *     description: Update an existing template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Template name
 *               description:
 *                 type: string
 *                 description: Template description
 *               system_instructions:
 *                 type: string
 *                 description: AI system instructions
 *               tone:
 *                 type: string
 *                 description: Content tone
 *               writing_style:
 *                 type: string
 *                 description: Writing style
 *               target_audience:
 *                 type: string
 *                 description: Target audience
 *               use_hashtags:
 *                 type: boolean
 *                 description: Whether to use hashtags
 *               max_hashtags:
 *                 type: integer
 *                 description: Maximum number of hashtags
 *               include_cta:
 *                 type: boolean
 *                 description: Whether to include call-to-action
 *               cta_type:
 *                 type: string
 *                 description: Call-to-action type
 *               is_public:
 *                 type: boolean
 *                 description: Whether template is public
 *               variables:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TemplateVariable'
 *                 description: Template variables
 *           example:
 *             name: "Updated LinkedIn Template"
 *             description: "Updated template description"
 *             system_instructions: "Updated system instructions..."
 *     responses:
 *       200:
 *         description: Template updated successfully
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
 *         description: Template not found
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
router.put('/:id', (req, res) => templateController.update(req as any, res));

/**
 * @swagger
 * /templates/{id}:
 *   delete:
 *     summary: Delete template
 *     description: Delete a template by ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Template deleted successfully"
 *               timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Template not found
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
router.delete('/:id', (req, res) => templateController.delete(req as any, res));

export { router as templateRoutes }; 