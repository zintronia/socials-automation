import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Templates from "@/features/templates/components/templates";
import type { Template } from "@/features/templates/types";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TemplateDialogProps {
  triggerLabel?: string;
  selectedTemplate?: Template | null;
  onSelect: (template: Template | null) => void;
}

export function TemplateDialog({ triggerLabel, selectedTemplate, onSelect }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            "flex justify-center items-center gap-2",
            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
          )}
        >
          <Paperclip className="w-4 h-4 transition-colors" />
          <span className="text-xs">{selectedTemplate?.name || triggerLabel || "No template selected"}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select a template</DialogTitle>
          <DialogDescription>Choose a template suitable for this platform.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-scroll h-[calc(100vh-200px)]">
          <Templates
            onSelectTemplate={(template) => {
              onSelect(template);
              setOpen(false);
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">Select</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
