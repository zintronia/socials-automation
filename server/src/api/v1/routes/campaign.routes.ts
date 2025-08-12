import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

import { createCampaignSchema, updateCampaignSchema } from '../validation/validation';
import { campaignController } from '../controllers/campaign.controller';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /campaigns:
 *   post:
 *     summary: Create a new campaign
 *     description: Create a new campaign with the specified details.
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *           example:
 *             title: "Spring Sale Campaign"
 *             description: "Campaign for the spring sale promotion."
 *             context_id: 1
 *             template_id: 2
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    '/',
    validateRequest(createCampaignSchema),
    (req, res) => campaignController.createCampaign(req as any, res)
);
//create a new campaign with title and description and return the campaign ID

/**
 * @swagger
 * /campaigns/{id}:
 *   put:
 *     summary: Update an existing campaign
 *     description: Update the details of an existing campaign.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the campaign to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCampaignRequest'
 *           example:
 *             title: "Updated Spring Sale Campaign"
 *             description: "Updated description for the spring sale promotion."
 *             context_id: 1
 *             template_id: 2
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

router.put(
    '/:id',
    validateRequest(updateCampaignSchema),
    (req, res) => campaignController.updateCampaign(req as any, res)
);
//update an existing campaign by ID

/**
 * @swagger
 * /campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     description: Delete an existing campaign by its ID.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the campaign to delete.
 *     responses:
 *       204:
 *         description: Campaign deleted successfully
 */
router.delete('/:id', (req, res) => campaignController.deleteCampaign(req as any, res));
//delete a campaign by ID and associated posts

/**
 * @swagger
 * /campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     description: Retrieve the details of a specific campaign by its ID.
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the campaign to retrieve.
 *     responses:
 *       200:
 *         description: Campaign details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', (req, res) => campaignController.getCampaignById(req as any, res));
//detailed campaign information including posts all the posts in the campaign

/**
 * @swagger
 * /campaigns:
 *   get:
 *     summary: Get all campaigns
 *     description: Retrieve a list of all campaigns.
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of campaigns retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', (req, res) => campaignController.getAllCampaigns(req as any, res));
//get all campaigns with pagination and filtering options only title and description , and last context used and template used

/**
 * @swagger
 * /campaigns/stats:
 *   get:
 *     summary: Get campaign statistics
 *     description: Retrieve statistics about campaigns for the authenticated user.
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: Campaign statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', (req, res) => campaignController.getCampaignStats(req as any, res));
//get campaign statistics for the user

export default router;