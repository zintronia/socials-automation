import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AccountDropdown } from "./AccountDropdown";
import { TemplateDialog } from "./TemplateDialog";
import type { Template } from "@/features/templates/types";
import type { SocialAccount } from "@/features/social/types";
import type { SelectedPlatform } from "../types";

interface PlatformRowProps {
  platform: { id: number; name: string; icon: React.ComponentType<{ className?: string }> };
  isSelected: boolean;
  selectedAccount?: SocialAccount | null;
  selectedTemplate?: Template | null;
  allAccounts: SocialAccount[];
  accountsLoading?: boolean;
  onToggle: () => void;
  onSelectAccount: (account: SocialAccount) => void;
  onSelectTemplate: (template: Template | null) => void;
}

export function PlatformRow({
  platform,
  isSelected,
  selectedAccount,
  selectedTemplate,
  allAccounts,
  accountsLoading,
  onToggle,
  onSelectAccount,
  onSelectTemplate,
}: PlatformRowProps) {
  const Icon = platform.icon;

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 mb-2" key={platform.id}>
        <Checkbox onClick={onToggle} checked={isSelected} />
        <Button
          type="button"
          key={platform.id}
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
            isSelected ? "text-blue-600" : "text-zinc-500 dark:text-zinc-400 hover:text-blue-600"
          )}
        >
          <span className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {platform.name}
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <AccountDropdown
          platformId={platform.id}
          accounts={allAccounts}
          value={selectedAccount || null}
          onChange={onSelectAccount}
          disabled={accountsLoading}
        />

        <TemplateDialog
          selectedTemplate={selectedTemplate || null}
          onSelect={onSelectTemplate}
        />
      </div>
    </div>
  );
}
