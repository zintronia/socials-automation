"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Post, PostSocialAccount } from "@/features/posts/types";
import { useLinkSocialAccountsMutation, useUnlinkSocialAccountMutation, useGetPostAccountsQuery } from "@/features/posts/services/api";
import { useSocial } from "@/features/social/hooks/useSocial";
import { SocialAccount } from "@/features/social/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Link, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SocialAccountSelectorProps {
  post: Post;
  onClose: () => void;
}

export function SocialAccountSelector({ post, onClose }: SocialAccountSelectorProps) {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Use the existing social hook for better integration
  const { accounts, platforms, accountsLoading } = useSocial();
  
  // Get currently linked accounts for this post
  const { data: linkedAccounts, isLoading: loadingLinked } = useGetPostAccountsQuery(post.id);
  
  // Mutations
  const [linkAccounts, { isLoading: isLinking }] = useLinkSocialAccountsMutation();
  const [unlinkAccount, { isLoading: isUnlinking }] = useUnlinkSocialAccountMutation();

  // Find the platform ID for this post
  const currentPlatform = useMemo(() => 
    platforms.find(p => p.name === post.platform_name),
    [platforms, post.platform_name]
  );

  // Filter accounts for the same platform using platform_id
  const platformAccounts = useMemo(() => 
    accounts.filter(account => 
      account.platform_id === currentPlatform?.id && 
      account.connection_status === 'connected' &&
      account.is_active
    ),
    [accounts, currentPlatform?.id]
  );

  // Initialize selected accounts with currently linked ones
  useEffect(() => {
    if (linkedAccounts) {
      setSelectedAccountIds(linkedAccounts.map(account => account.id.toString()));
    }
  }, [linkedAccounts]);

  const handleAccountToggle = (accountId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAccountIds(prev => [...prev, accountId]);
    } else {
      setSelectedAccountIds(prev => prev.filter(id => id !== accountId));
    }
  };

  const handleSave = async () => {
    setError(null);
    
    try {
      // Get currently linked account IDs
      const currentlyLinked = linkedAccounts?.map(acc => acc.id.toString()) || [];
      
      // Find accounts to link (newly selected)
      const toLink = selectedAccountIds.filter(id => !currentlyLinked.includes(id));
      
      // Find accounts to unlink (previously selected but now unselected)
      const toUnlink = currentlyLinked.filter(id => !selectedAccountIds.includes(id));

      // Validate that we're not removing all accounts
      if (selectedAccountIds.length === 0) {
        setError("Please select at least one account to link to this post.");
        return;
      }

      // Link new accounts
      if (toLink.length > 0) {
        await linkAccounts({
          postId: post.id,
          social_account_ids: toLink.map(id => parseInt(id))
        }).unwrap();
      }

      // Unlink removed accounts
      for (const accountId of toUnlink) {
        await unlinkAccount({
          postId: post.id,
          accountId: parseInt(accountId)
        }).unwrap();
      }

      // Small delay to let the cache update, then close
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error: any) {
      setError(error?.data?.message || error?.message || 'Failed to update social accounts');
    }
  };

  if (accountsLoading || loadingLinked) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading accounts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select {post.platform_name} Accounts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which accounts to link with this post
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!currentPlatform ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Platform "{post.platform_name}" not found. Please check your platform configuration.
            </AlertDescription>
          </Alert>
        ) : platformAccounts.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active {post.platform_name} accounts available. Please connect an account first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {platformAccounts.map((account) => {
              const isSelected = selectedAccountIds.includes(account.id);
              const isCurrentlyLinked = linkedAccounts?.some(linked => linked.id.toString() === account.id);
              
              return (
                <div
                  key={account.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <Checkbox
                    id={`account-${account.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleAccountToggle(account.id, checked as boolean)
                    }
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={account.profile_image_url || ""} />
                    <AvatarFallback>
                      {account.account_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {account.account_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{account.account_username}
                    </p>
                    {account.follower_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {account.follower_count.toLocaleString()} followers
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {isCurrentlyLinked && (
                      <Badge variant="secondary" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        Linked
                      </Badge>
                    )}
                    {account.is_verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={isLinking || isUnlinking}
            className="flex-1"
          >
            {isLinking || isUnlinking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLinking || isUnlinking}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
