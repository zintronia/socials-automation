import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Bot } from "lucide-react";
import type { SocialAccount } from "@/features/social/types";

interface AccountDropdownProps {
  platformId: number;
  accounts: SocialAccount[];
  value?: SocialAccount | null;
  onChange: (account: SocialAccount) => void;
  disabled?: boolean;
}

export function AccountDropdown({
  platformId,
  accounts,
  value,
  onChange,
  disabled,
}: AccountDropdownProps) {
  const filtered = accounts.filter(
    (a) => a.platform_id === platformId && a.is_active && a.connection_status === "connected"
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between" disabled={disabled}>
          <span className="truncate">{value?.account_name || "Select account"}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px] p-0">
        {disabled ? (
          <div className="px-3 py-2 text-sm text-zinc-500">Loading accounts...</div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-2 text-sm text-zinc-500">No connected accounts</div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {filtered.map((account) => (
              <DropdownMenuItem
                key={account.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onChange(account)}
              >
                {account.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.profile_image_url} alt="" className="h-6 w-6 rounded-full" />
                ) : (
                  <Bot className="h-4 w-4 text-zinc-400" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">{account.account_name}</span>
                  {account.account_username && (
                    <span className="text-xs text-zinc-500">@{account.account_username}</span>
                  )}
                </div>
                {value?.id === account.id && <Check className="ml-auto h-4 w-4 text-blue-600" />}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
