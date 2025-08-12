import { ContentCategory, Platform } from "@/types/template.types";
import { Twitter, Linkedin, Instagram, Facebook, } from "lucide-react";

export const socialPlatforms: Platform[] = [
    { id: 1, name: 'Twitter', max_content_length: 280, supported_media_types: ['image', 'video'], icon: Twitter },
    { id: 2, name: 'LinkedIn', max_content_length: 3000, supported_media_types: ['image', 'video', 'document'], icon: Linkedin },
    // { id: 3, name: 'Instagram', max_content_length: 2200, supported_media_types: ['image', 'video'], icon: Instagram },
    // { id: 4, name: 'Facebook', max_content_length: 63206, supported_media_types: ['image', 'video'], icon: Facebook },
    // { id: 5, name: 'Reddit', max_content_length: 40000, supported_media_types: ['image', 'video'], icon: Reddit },
];


export const socialPlatformId = {
    TWITTER: "Twitter",
    LINKEDIN: "LinkedIn",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    REDDIT: "Reddit",
}



export const mockCategories: ContentCategory[] = [
    { id: 1, name: 'Promotional', description: 'Marketing and promotional content' },
    { id: 2, name: 'Educational', description: 'Educational and informative content' },
    { id: 3, name: 'Engagement', description: 'Content designed to increase engagement' },
    { id: 4, name: 'Entertainment', description: 'Fun and entertaining content' }
];