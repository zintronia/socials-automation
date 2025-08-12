"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import React from "react";
import { useGetSocialAccountsQuery } from "../services/socialApi";
import { Loader } from "@/components/ai-elements/loader";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export type SocialConnectCardProps = {
  name: string;
  iconSrc: string; // path under public/
  description: string;
  platformId?: number; // preferred for filtering
  platformName?: string; // used to filter connected accounts
  onConnect?: () => void;
  onViewConnected?: () => void;
  connectLabel?: string;
  viewConnectedLabel?: string;
  actions?: React.ReactNode; // optional custom actions area override
};

export function SocialConnectCard({
  name,
  iconSrc,
  description,
  platformId,
  platformName,
  onConnect,
  onViewConnected,
  connectLabel = "Connect",
  viewConnectedLabel = "View connected",
  actions,
}: SocialConnectCardProps) {
  const { data: accounts, isLoading } = useGetSocialAccountsQuery(
    platformId ? { connectionStatus: 'connected', platformId } : { connectionStatus: 'connected' }
  );
  const platformAccounts = (accounts || []).filter((a) => {
    if (platformId) return a.platform_id === platformId;
    if (platformName) return (a.platform_name || '').toLowerCase() === platformName.toLowerCase();
    return true;
  });
  const visible = platformAccounts.slice(0, 3);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between gap-2">
        <div className="flex flex-col items-start gap-2">
          <div className="p-2 border border-gray-200 rounded-lg">
            <Image
              aria-hidden
              src={iconSrc}
              className="text-black"
              alt={`${name} icon`}
              width={25}
              height={25}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end">
          {actions ? (
            actions
          ) : (
            <>
              <Button onClick={onConnect}>{connectLabel}</Button>
              <div className="flex flex-row items-center gap-2 mt-2" onClick={onViewConnected}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader size={16} />
                    <span className="text-xs">Loading accounts…</span>
                  </div>
                ) : (
                  <>
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                      {visible.map((acc) => {
                        const initials = (acc.account_name || acc.account_username || '?')
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();
                        const title = acc.account_username
                          ? `${acc.account_name} (@${acc.account_username})`
                          : acc.account_name;
                        return (

                          <Avatar key={acc.id}>
                            <AvatarImage src={acc.profile_image_url || ''} alt={title} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>

                        );
                      })}
                    </div>
                    {platformAccounts.length > 0 && (
                      <div className="text-md  flex flex-col">
                        <span className="font-bold">{platformAccounts.length}+</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialConnectCard;
