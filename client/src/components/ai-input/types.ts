import type { Template } from "@/features/templates/types";
import type { SocialAccount } from "@/features/social/types";
import type { GeneratePayload } from "@/features/posts";

export interface SelectedPlatform {
  id: number;
  name: string;
  icon: React.ReactNode;
  selectedTemplate?: Template | null;
  selectedAccount?: SocialAccount | null;
}

export interface AI_PromptProps {
  handleGenerate: (data: GeneratePayload) => Promise<void> | void;
  isSubmitting?: boolean;
}
