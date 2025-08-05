import { ContentCategory, Platform } from "@/types/template.types";

export const mockPlatforms: Platform[] = [
    { id: 1, name: 'Twitter', max_content_length: 280, supported_media_types: ['image', 'video'] },
    { id: 2, name: 'LinkedIn', max_content_length: 3000, supported_media_types: ['image', 'video', 'document'] },
    { id: 3, name: 'Instagram', max_content_length: 2200, supported_media_types: ['image', 'video'] },
    { id: 4, name: 'Facebook', max_content_length: 63206, supported_media_types: ['image', 'video'] }
];

export const mockCategories: ContentCategory[] = [
    { id: 1, name: 'Promotional', description: 'Marketing and promotional content' },
    { id: 2, name: 'Educational', description: 'Educational and informative content' },
    { id: 3, name: 'Engagement', description: 'Content designed to increase engagement' },
    { id: 4, name: 'Entertainment', description: 'Fun and entertaining content' }
];