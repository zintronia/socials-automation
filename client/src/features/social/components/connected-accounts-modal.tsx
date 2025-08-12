"use client";

import React from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Loader } from "@/components/ai-elements/loader";
import {
    useGetSocialAccountsQuery,
    useDisconnectAccountMutation,
} from "../services/socialApi";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConnectedAccountsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    platformId: number | null;
    platformName?: string;
    platformIconSrc?: string;
};

export function ConnectedAccountsModal({ open, onOpenChange, platformId, platformName, platformIconSrc }: ConnectedAccountsModalProps) {
    const enabled = open && !!platformId;
    const { data: accounts, isLoading, isFetching } = useGetSocialAccountsQuery(
        enabled ? { connectionStatus: "connected", platformId: platformId! } : undefined
    );
    const [disconnectAccount, { isLoading: isDisconnecting }] = useDisconnectAccountMutation();

    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [pending, setPending] = React.useState<null | { id: string | number; title: string }>(null);

    const onRequestDisconnect = (accountId: string | number, title: string) => {
        setPending({ id: accountId, title });
        setConfirmOpen(true);
    };

    const onConfirmDisconnect = async () => {
        if (!pending) return;
        try {
            await disconnectAccount(String(pending.id)).unwrap();
            setConfirmOpen(false);
            setPending(null);
        } catch (e) {
            console.error("Disconnect failed", e);
        }
    };

    const list = accounts || [];

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <div className="flex items-start gap-3">
                            {platformIconSrc ? (
                                <div className="p-2 border border-gray-200 rounded-md">
                                    <Image src={platformIconSrc} alt={platformName || "Platform"} width={28} height={28} />
                                </div>
                            ) : null}
                            <div>
                                <DialogTitle className="text-xl">Connected {platformName || "accounts"}</DialogTitle>
                                <DialogDescription className="text-sm">
                                    Manage your connections. Click disconnect to revoke access.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="border-t border-border/60 -mx-6" />

                    {isLoading || isFetching ? (
                        <div className="space-y-3 py-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                                    <div className="flex items-center gap-3 min-w-0 w-full">
                                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                                            <div className="h-2 w-24 bg-muted rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-8 w-24 rounded bg-muted animate-pulse" />
                                </div>
                            ))}
                            <div className="flex items-center gap-2 text-muted-foreground justify-center pt-2">
                                <Loader size={18} />
                                <span className="text-sm">Loading connected accounts…</span>
                            </div>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-10 text-center">No connected accounts.</div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total connected: <span className="font-medium text-foreground">{list.length}</span></span>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {list.map((acc) => {
                                    const title = acc.account_username
                                        ? `${acc.account_name} (@${acc.account_username})`
                                        : acc.account_name;
                                    const initials = (acc.account_name || acc.account_username || "?")
                                        .split(" ")
                                        .map((p) => p[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();
                                    return (
                                        <div
                                            key={acc.id}
                                            className="flex items-center justify-between gap-3 border rounded-lg p-3 hover:bg-muted/40 transition-colors shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar>
                                                    <AvatarImage src={acc.profile_image_url || ""} alt={title} />
                                                    <AvatarFallback>{initials}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{title}</div>
                                                    <div className="text-xs text-muted-foreground">ID: {acc.account_id}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => onRequestDisconnect(acc.id, title)}
                                                    disabled={isDisconnecting}
                                                >
                                                    Disconnect
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="border-t border-border/60 -mx-6 mt-3" />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending?.title ? (
                                <>You are about to disconnect <span className="font-medium">{pending.title}</span>. This will revoke access for this application.</>
                            ) : (
                                <>This will revoke access for the selected account.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDisconnect} disabled={isDisconnecting}>
                            {isDisconnecting ? "Disconnecting…" : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default ConnectedAccountsModal;
