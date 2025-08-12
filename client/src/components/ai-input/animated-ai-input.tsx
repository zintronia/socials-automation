"use client";

import { ArrowRight, ChevronDown, Check, Bot, Paperclip } from "lucide-react";
import { useState } from "react";
import { socialPlatforms } from "@/lib/constant";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Contexts } from "@/features/context";
import { Template } from "@/features/templates/types";
import { Context } from "@/features/context/types";
import { useGetSocialAccountsQuery } from "@/features/social/services/socialApi";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextarea";
import type { AI_PromptProps, SelectedPlatform } from "./types";
import { PlatformRow } from "./components/PlatformRow";
import { toast } from "sonner";


export function AI_Prompt({
    handleGenerate,
    isSubmitting = false,
}: AI_PromptProps) {
    const [content, setContent] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState<SelectedPlatform[]>([]);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
    const [openTemplates, setOpenTemplates] = useState(false);
    const [openContexts, setOpenContexts] = useState(false);
    // Fetch all connected social accounts once, then filter per platform row
    const { data: socialAccounts = [], isLoading: accountsLoading } = useGetSocialAccountsQuery();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedContext, setSelectedContext] = useState<Context | null>(null);
    const [generatingPost, setGeneratingPost] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    console.log("Selected Platforms:", selectedPlatforms);

    const AI_MODELS = [
        "o3-mini",
        "Gemini 2.5 Flash",
        "Claude 3.5 Sonnet",
        "GPT-4-1 Mini",
        "GPT-4-1",
    ];

    const MODEL_ICONS: Record<string, React.ReactNode> = {
        "o3-mini": <Bot className="w-4 h-4 opacity-50" />,
        "Gemini 2.5 Flash": (
            <svg
                height="1em"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>Gemini</title>
                <defs>
                    <linearGradient
                        id="lobe-icons-gemini-fill"
                        x1="0%"
                        x2="68.73%"
                        y1="100%"
                        y2="30.395%"
                    >
                        <stop offset="0%" stopColor="#1C7DFF" />
                        <stop offset="52.021%" stopColor="#1C69FF" />
                        <stop offset="100%" stopColor="#F0DCD6" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
                    fill="url(#lobe-icons-gemini-fill)"
                    fillRule="nonzero"
                />
            </svg>
        ),
        "Claude 3.5 Sonnet": (
            <>
                <svg
                    fill="#000"
                    fillRule="evenodd"
                    className="w-4 h-4 dark:hidden block"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Anthropic Icon Light</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
                <svg
                    fill="#fff"
                    fillRule="evenodd"
                    className="w-4 h-4 hidden dark:block"
                    viewBox="0 0 24 24"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <title>Anthropic Icon Dark</title>
                    <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
                </svg>
            </>
        ),
        "GPT-4-1 Mini": <Bot className="w-4 h-4 opacity-50" />,
        "GPT-4-1": <Bot className="w-4 h-4 opacity-50" />,
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && content.trim()) {
            e.preventDefault();
            adjustHeight(true);
            // Here you can add message sending     
        }
    };

    return (
        <>

            <div className="w-full md:w-full lg:w-4/6">

                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
                    <div className="relative">
                        {/* External Toggle Button (visible when drawer is closed) */}
                        {!isDrawerOpen && (

                            <div onClick={() => setIsDrawerOpen(true)} className="absolute bottom-full right-2 translate-y-0 z-[60] dark:bg-white/10 p-1 transition-colors py-1 px-5 bg-blue-500 rounded-t-lg">
                                <ChevronDown className="w-4 h-4 transition-transform duration-200 rotate-180" />
                            </div>
                        )}

                        {/* Expandable Drawer */}
                        <motion.div
                            initial={false}
                            animate={{
                                height: isDrawerOpen ? 'auto' : 0,
                                opacity: isDrawerOpen ? 1 : 0
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-0 right-0 bottom-full z-50 overflow-hidden bg-transparent"
                        >
                            {/* Drawer Toggle Button (moves with drawer, only when open) */}
                            <div className="flex justify-end">
                                {isDrawerOpen && (
                                    <div className="py-1 px-5  bg-blue-500 rounded-t-lg mr-5" onClick={() => setIsDrawerOpen(false)}>
                                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                                    </div>
                                )}</div>
                            <div className="rounded-t-2xl bg-white dark:bg-zinc-900">

                                <div className="p-4">
                                    <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                                        Generated Post for
                                    </h5>
                                    <>
                                        {socialPlatforms.map((platform) => {
                                            const isSelected = selectedPlatforms.some((p) => p.id === platform.id);
                                            const current = selectedPlatforms.find((p) => p.id === platform.id);
                                            return (
                                                <PlatformRow
                                                    key={platform.id}
                                                    platform={platform}
                                                    isSelected={isSelected}
                                                    selectedAccount={current?.selectedAccount || null}
                                                    selectedTemplate={current?.selectedTemplate || null}
                                                    allAccounts={socialAccounts}
                                                    accountsLoading={accountsLoading}
                                                    onToggle={() =>
                                                        setSelectedPlatforms((prev: any) => {
                                                            const exists = prev.some((p: any) => p.id === platform.id);
                                                            if (exists) return prev.filter((p: any) => p.id !== platform.id);
                                                            return [
                                                                ...prev,
                                                                { id: platform.id, name: platform.name, icon: platform.icon },
                                                            ];
                                                        })
                                                    }
                                                    onSelectAccount={(account) =>
                                                        setSelectedPlatforms((prev: any) => {
                                                            const exists = prev.some((p: any) => p.id === platform.id);
                                                            if (exists) {
                                                                return prev.map((p: any) =>
                                                                    p.id === platform.id ? { ...p, selectedAccount: account } : p
                                                                );
                                                            }
                                                            return [
                                                                ...prev,
                                                                { id: platform.id, name: platform.name, icon: platform.icon, selectedAccount: account },
                                                            ];
                                                        })
                                                    }
                                                    onSelectTemplate={(template) =>
                                                        setSelectedPlatforms((prev: any) => {
                                                            const exists = prev.some((p: any) => p.id === platform.id);
                                                            if (exists) {
                                                                return prev.map((p: any) =>
                                                                    p.id === platform.id ? { ...p, selectedTemplate: template } : p
                                                                );
                                                            }
                                                            return [
                                                                ...prev,
                                                                { id: platform.id, name: platform.name, icon: platform.icon, selectedTemplate: template },
                                                            ];
                                                        })
                                                    }
                                                />
                                            );
                                        })}
                                    </>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                    {/* AI Input */}
                    <div className="relative">
                        <div className="relative flex flex-col">
                            <div
                                className="overflow-y-auto"
                                style={{ maxHeight: "400px" }}
                            >
                                <Textarea
                                    id="ai-input-15"
                                    value={content}
                                    placeholder={"What can I do for you?"}
                                    className={cn(
                                        "w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                        "min-h-[72px]"
                                    )}
                                    ref={textareaRef}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        adjustHeight();
                                    }}
                                />
                            </div>

                            <div className="h-14 bg-black/5 dark:bg-white/5 rounded-b-xl flex items-center">
                                <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                    <div className="flex items-center gap-2">
                                        {/* <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                                >
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={selectedModel}
                                                            initial={{
                                                                opacity: 0,
                                                                y: -5,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: 5,
                                                            }}
                                                            transition={{
                                                                duration: 0.15,
                                                            }}
                                                            className="flex items-center gap-1"
                                                        >
                                                            {
                                                                MODEL_ICONS[
                                                                selectedModel
                                                                ]
                                                            }
                                                            {selectedModel}
                                                            <ChevronDown className="w-3 h-3 opacity-50" />
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className={cn(
                                                    "min-w-[10rem]",
                                                    "border-black/10 dark:border-white/10",
                                                    "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                                )}
                                            >
                                                {AI_MODELS.map((model) => (
                                                    <DropdownMenuItem
                                                        key={model}
                                                        onSelect={() =>
                                                            setSelectedModel(model)
                                                        }
                                                        className="flex items-center justify-between gap-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {MODEL_ICONS[model] || (
                                                                <Bot className="w-4 h-4 opacity-50" />
                                                            )}
                                                            <span>{model}</span>
                                                        </div>
                                                        {selectedModel ===
                                                            model && (
                                                                <Check className="w-4 h-4 text-blue-500" />
                                                            )}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu> */}
                                        {/* <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" /> */}
                                        {/* <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" /> */}
                                        {/* <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" /> */}


                                        <Dialog>
                                            <form>
                                                <DialogTrigger asChild>
                                                    <div className={cn(
                                                        'flex justify-center items-center gap-2',
                                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                                        "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                                    )}
                                                        onClick={() => setOpenContexts(!openContexts)}>
                                                        <Paperclip className="w-4 h-4 transition-colors" />
                                                        <span className="text-xs">
                                                            {selectedContext?.title || 'context'}
                                                        </span>
                                                    </div>

                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh]">
                                                    <DialogHeader>
                                                        <DialogTitle>Context
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            ""                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="overflow-y-scroll h-[calc(100vh-200px)]">
                                                        <Contexts onSelectContext={(context) => {
                                                            setContent(context.content)
                                                            setSelectedContext(context);
                                                            setOpenContexts(false);
                                                        }}
                                                            selectedContextId={selectedContext?.id}
                                                            showActions={false}
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button type="submit">Select</Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </form>
                                        </Dialog>
                                    </div>
                                    <button
                                        type="button"
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                        aria-label="Send message"
                                        disabled={
                                            isSubmitting || (
                                                !(selectedPlatforms.length > 0) &&
                                                !(content.trim() && selectedPlatforms.length > 0)
                                            )
                                        }
                                        onClick={async () => {
                                            if (isSubmitting) return;
                                            if (!content.trim() && selectedPlatforms.length === 0) {
                                                toast.error("Please enter content or select platforms.");
                                                return;
                                            }
                                            setGeneratingPost(true);
                                            try {
                                                const platforms = selectedPlatforms.map(sp => ({
                                                    platform_id: sp.id,
                                                    template_id: sp.selectedTemplate?.id ?? undefined,
                                                    social_account_id: sp.selectedAccount?.id,
                                                }));

                                                await handleGenerate({
                                                    context_id: selectedContext?.id,
                                                    platforms,
                                                    prompt: content,
                                                });

                                            } catch (e) {
                                                console.error("Generation failed:", e);
                                            } finally {
                                                adjustHeight(true);
                                                setGeneratingPost(false);
                                            }
                                        }}
                                    >
                                        <ArrowRight
                                            className={cn(
                                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                                content.trim()
                                                    ? "opacity-100"
                                                    : "opacity-30"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

        </>
    );
}