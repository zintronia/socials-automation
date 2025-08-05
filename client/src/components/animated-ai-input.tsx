"use client";

import { ArrowRight, Bot, Check, ChevronDown, Paperclip, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { mockPlatforms } from "@/lib/constant";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Templates from "../features/templates/components/templates";
import { motion, AnimatePresence } from "framer-motion";
import { Contexts } from "@/features/context";
import { Template } from "@/features/templates/types";
import { Context } from "@/features/context/types";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const OPENAI_ICON = (
    <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 dark:hidden block"
        >
            <title>OpenAI Icon Light</title>
            <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
        </svg>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 256 260"
            aria-label="OpenAI Icon"
            className="w-4 h-4 hidden dark:block"
        >
            <title>OpenAI Icon Dark</title>
            <path
                fill="#fff"
                d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
            />
        </svg>
    </>
);

interface AI_PromptProps {
    handleGenerate: (data: {
        content: string;
        platform_id: number | null;
        model: string;
        type: string;
        template_id?: number | null;
        context_id?: number | null;
    }) => void;
    isSubmitting?: boolean;
}

export function AI_Prompt({
    handleGenerate,
    isSubmitting = false,
}: AI_PromptProps) {
    const [content, setContent] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<number | null>(1);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });
    const [selectedModel, setSelectedModel] = useState("GPT-4-1 Mini");
    const [openTemplates, setOpenTemplates] = useState(false);
    const [openContexts, setOpenContexts] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedContext, setSelectedContext] = useState<Context | null>(null);
    console.log("Selected AI Model:", selectedModel);
    console.log('current content:', content);
    console.log('selected template:', selectedTemplate);
    console.log('selected context:', selectedContext);

    const AI_MODELS = [
        "o3-mini",
        "Gemini 2.5 Flash",
        "Claude 3.5 Sonnet",
        "GPT-4-1 Mini",
        "GPT-4-1",
    ];

    const MODEL_ICONS: Record<string, React.ReactNode> = {
        "o3-mini": OPENAI_ICON,
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
        "GPT-4-1 Mini": OPENAI_ICON,
        "GPT-4-1": OPENAI_ICON,
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
            <div className="w-4/6 py-4">
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5">
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
                                        <DropdownMenu>
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
                                        </DropdownMenu>
                                        <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
                                                    {selectedPlatform ? (
                                                        <>
                                                            {selectedPlatform === 1 && <Twitter className="h-4 w-4" />}
                                                            {selectedPlatform === 2 && <Linkedin className="h-4 w-4" />}
                                                            {selectedPlatform === 3 && <Instagram className="h-4 w-4" />}
                                                            {selectedPlatform === 4 && <Facebook className="h-4 w-4" />}
                                                            {mockPlatforms.find(p => p.id === selectedPlatform)?.name || 'Select Platform'}
                                                        </>
                                                    ) : (
                                                        'Select Platform'
                                                    )}
                                                    <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px]">
                                                {mockPlatforms.map((platform) => (
                                                    <DropdownMenuItem
                                                        key={platform.id}
                                                        onClick={() => setSelectedPlatform(platform.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {platform.id === 1 && <Twitter className="h-4 w-4" />}
                                                        {platform.id === 2 && <Linkedin className="h-4 w-4 " />}
                                                        {platform.id === 3 && <Instagram className="h-4 w-4 " />}
                                                        {platform.id === 4 && <Facebook className="h-4 w-4 " />}
                                                        <span>{platform.name}</span>
                                                        {selectedPlatform === platform.id && (
                                                            <Check className="ml-auto h-4 w-4 text-green-500" />
                                                        )}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
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
                                                        onClick={() => setOpenTemplates(!openTemplates)}>
                                                        <Paperclip className="w-4 h-4 transition-colors" />
                                                        <span className="text-xs">
                                                            {selectedTemplate ? selectedTemplate?.name : 'template'}
                                                        </span>
                                                    </div>

                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-hidden">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                        </DialogTitle>
                                                        <DialogDescription>

                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="overflow-y-scroll h-[calc(100vh-200px)]">
                                                        <Templates onSelectTemplate={(template) => {
                                                            setSelectedTemplate(template);
                                                            setOpenTemplates(false);
                                                        }}
                                                            selectedTemplateId={selectedTemplate?.id}
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
                                        disabled={!content.trim() || isSubmitting}
                                        onClick={() => {
                                            if (!content.trim() || isSubmitting) return;
                                            handleGenerate({
                                                content,
                                                platform_id: selectedPlatform,
                                                model: selectedModel,
                                                type: 'text',
                                                template_id: selectedTemplate?.id,
                                                context_id: selectedContext?.id
                                            });
                                            adjustHeight(true);
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