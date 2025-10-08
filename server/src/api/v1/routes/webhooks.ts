import { Router } from "express";
import { verifyWebhook } from '@clerk/express/webhooks';
import { logger } from "../../../utils/logger.utils";
import { userService } from "../../../services/user.service";
import { UserJSON } from "@clerk/express";

const router = Router();


router.get('/user', async (req, res) => {
    res.status(200).send('working')

})

router.post('/user', async (req, res) => {
    try {
        const evt = await verifyWebhook(req);
        const { id: clerkId, first_name, last_name, email_addresses, image_url } = evt.data as UserJSON;
        const email = email_addresses?.[0]?.email_address || '';

        logger.info(`Processing webhook event: ${evt.type}`, { clerkId, email });

        switch (evt.type) {
            case 'user.created':
            case 'user.updated':
                await handleUserUpsert({
                    clerkId,
                    email,
                    first_name,
                    last_name,
                    profile_image_url: image_url
                });
                break;

            case 'user.deleted':
                await userService.deleteUser(clerkId);
                logger.info(`Deleted user with clerkId: ${clerkId}`);
                break;

            default:
                logger.info(`Unhandled event type: ${evt.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Webhook error:', error as unknown as string);
        return res.status(400).json({ error: 'Webhook error', details: error });
    }
});

async function handleUserUpsert(userData: {
    clerkId: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url?: string;
}) {
    const { clerkId, email, profile_image_url } = userData;
    const first_name_str = userData.first_name || '';
    const last_name_str = userData.last_name || '';

    if (!email) {
        throw new Error('Email is required for user upsert');
    }

    const existingUser = await userService.findUserByClerkId(clerkId);

    if (existingUser) {
        await userService.updateUser(clerkId, {
            email,
            first_name: first_name_str,
            last_name: last_name_str,
            profile_image_url
        });
        logger.info(`Updated user with clerkId: ${clerkId}`);
    } else {
        await userService.createUser({
            clerkId,
            email,
            first_name: first_name_str,
            last_name: last_name_str,
            profile_image_url
        });
        logger.info(`Created new user with clerkId: ${clerkId}`);
    }
}

export { router as webhookRoutes };