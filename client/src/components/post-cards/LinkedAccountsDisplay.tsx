"use client";

import React from "react";
import { Post } from "@/features/posts/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface LinkedAccountsDisplayProps {
  post: Post;
  maxVisible?: number;
}

export function LinkedAccountsDisplay({ post, maxVisible = 3 }: LinkedAccountsDisplayProps) {
  const accounts = post.social_accounts || [];
  const visibleAccounts = accounts.slice(0, maxVisible);
  const remainingCount = Math.max(0, accounts.length - maxVisible);

  if (accounts.length === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>No accounts</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-2 w-2 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-2 w-2 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-2 w-2 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Account Avatars */}
        <div className="flex -space-x-1">
          {visibleAccounts.map((account, index) => (
            <Tooltip key={account.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarImage 
                      src={account.profile_image_url || ""} 
                      alt={account.account_name || "Account"}
                    />
                    <AvatarFallback className="text-xs">
                      {account.account_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  {account.status && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIcon(account.status)}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="space-y-1">
                  <p className="font-medium">{account.account_name}</p>
                  <p className="text-muted-foreground">@{account.account_username}</p>
                  {account.status && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {account.status}
                    </Badge>
                  )}
                  {account.scheduled_for && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled: {new Date(account.scheduled_for).toLocaleString()}
                    </p>
                  )}
                  {account.published_at && (
                    <p className="text-xs text-muted-foreground">
                      Published: {new Date(account.published_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {/* Show remaining count */}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>{remainingCount} more account{remainingCount > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Account count and status summary */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{accounts.length}</span>
          {accounts.length > 0 && (
            <div className="flex gap-0.5">
              {accounts.some(acc => acc.status === 'published') && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {accounts.some(acc => acc.status === 'scheduled') && (
                <Clock className="h-3 w-3 text-blue-500" />
              )}
              {accounts.some(acc => acc.status === 'failed') && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
