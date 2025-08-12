'use client';

import { SocialConnectCard } from '@/features/social/components/social-connect-card';
import { SOCIAL_ORDER, SOCIAL_PLATFORMS } from '@/features/social/config/platforms';
import { ConnectedAccountsModal } from '@/features/social/components/connected-accounts-modal';
import React from 'react';
import ComponentCard from '@/components/ComponentCard';
import { useSocial } from '@/features/social/hooks/useSocial';
import { toast } from 'sonner';

export default function Social() {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedPlatformId, setSelectedPlatformId] = React.useState<number | null>(null);
    const [selectedPlatformName, setSelectedPlatformName] = React.useState<string | undefined>(undefined);
    const [selectedPlatformIconSrc, setSelectedPlatformIconSrc] = React.useState<string | undefined>(undefined);
    const { startTwitterOAuth } = useSocial();

    const handleConnect = async (key: keyof typeof SOCIAL_PLATFORMS) => {
        try {
            switch (key) {
                case 'twitter': {
                    const callbackUrl = `${window.location.origin}/social/callback`;
                    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'];
                    const result = await startTwitterOAuth(callbackUrl, scopes);
                    if (result.success && result.data) {
                        localStorage.setItem('twitter_oauth_state', result.data.state);
                        window.location.href = result.data.authUrl;
                    } else {
                        toast.error(result.error || 'Failed to initiate Twitter OAuth');
                    }
                    break;
                }
                // Add other platforms here as they get supported
                default:
                    toast.info('Connect flow coming soon for ' + SOCIAL_PLATFORMS[key].name);
            }
        } catch (error) {
            console.error('Connect error:', error);
            toast.error('Failed to start connect flow');
        }
    }

    const handleViewConnected = (key: keyof typeof SOCIAL_PLATFORMS) => {
        const cfg = SOCIAL_PLATFORMS[key];
        setSelectedPlatformId(cfg.id);
        setSelectedPlatformName(cfg.name);
        setSelectedPlatformIconSrc(cfg.iconSrc);
        setModalOpen(true);
    }

    return (
        <ComponentCard title="Social Accounts" desc="Connect and manage your social media accounts in one place." className="rounded-none">
            <ConnectedAccountsModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                platformId={selectedPlatformId}
                platformName={selectedPlatformName}
                platformIconSrc={selectedPlatformIconSrc}
            />
            <div className='grid grid-cols-1 gap-4'>
                {SOCIAL_ORDER.map((key) => {
                    const cfg = SOCIAL_PLATFORMS[key]
                    return (
                        <SocialConnectCard
                            key={cfg.key}
                            name={cfg.name}
                            iconSrc={cfg.iconSrc}
                            description={cfg.description}
                            platformId={cfg.id}
                            platformName={cfg.name}
                            connectLabel={cfg.connectLabel}
                            viewConnectedLabel={cfg.viewConnectedLabel}
                            onConnect={() => handleConnect(cfg.key)}
                            onViewConnected={() => handleViewConnected(cfg.key)}
                        />
                    )
                })}
            </div>
        </ComponentCard>

    )
}