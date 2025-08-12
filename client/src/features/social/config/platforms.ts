export type SocialPlatformKey =
  | "twitter"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "pinterest"
  | "reddit"
  | "telegram"
  | "threads"
  | "whatsapp";

export interface SocialPlatformConfig {
  id: number;
  key: SocialPlatformKey;
  name: string;
  iconSrc: string; // path in public/
  description: string;
  connectLabel?: string;
  viewConnectedLabel?: string;
}

export const SOCIAL_PLATFORMS: Record<SocialPlatformKey, SocialPlatformConfig> = {
  twitter: {
    id: 1,
    key: "twitter",
    name: "Twitter",
    iconSrc: "/socials/X.svg",
    description: "Connect your Twitter account",
  },
  linkedin: {
    id: 2,
    key: "linkedin",
    name: "LinkedIn",
    iconSrc: "/socials/linkedIn.svg",
    description: "Connect your LinkedIn account",
  },
  instagram: {
    id: 3,
    key: "instagram",
    name: "Instagram",
    iconSrc: "/socials/instagram.svg",
    description: "Connect your Instagram account",
  },
  facebook: {
    id: 4,
    key: "facebook",
    name: "Facebook",
    iconSrc: "/socials/facebook.svg",
    description: "Connect your Facebook account",
  },
  reddit: {
    id: 5,
    key: "reddit",
    name: "Reddit",
    iconSrc: "/socials/reddit.svg",
    description: "Connect your Reddit account",
  },

  tiktok: {
    id: 6,
    key: "tiktok",
    name: "TikTok",
    iconSrc: "/socials/tiktok.svg",
    description: "Connect your TikTok account",
  },
  pinterest: {
    id: 7,
    key: "pinterest",
    name: "Pinterest",
    iconSrc: "/socials/pinterest.svg",
    description: "Connect your Pinterest account",
  },

  telegram: {
    id: 8,
    key: "telegram",
    name: "Telegram",
    iconSrc: "/socials/telegram.svg",
    description: "Connect your Telegram account",
  },
  threads: {
    id: 9,
    key: "threads",
    name: "Threads",
    iconSrc: "/socials/tread.svg",
    description: "Connect your Threads account",
  },
  whatsapp: {
    id: 10,
    key: "whatsapp",
    name: "WhatsApp",
    iconSrc: "/socials/whatsapp.svg",
    description: "Connect your WhatsApp",
  },
};

export const SOCIAL_ORDER: SocialPlatformKey[] = [
  "twitter",
  "linkedin",
  "instagram",
  "facebook",
  "reddit",
  "tiktok",
  "pinterest",
  "telegram",
  "threads",
  "whatsapp",
];
