import type { CapaTemplate } from '../../types';
import { premiumCapaTemplates } from './premiumLayouts';
import { creativeCapaTemplates } from './creativeLayouts';
import { smartCapaTemplates } from './smartLayouts';

// Aggregate all templates
export const allCapaTemplates: CapaTemplate[] = [
    ...smartCapaTemplates,
    ...premiumCapaTemplates,
    ...creativeCapaTemplates
];

/**
 * Get recommended layouts based on image count and tags
 */
export function getRecommendedLayouts(count: number, tags: string[] = []): CapaTemplate[] {
    // 1. Filter by image count constraints
    const validTemplates = allCapaTemplates.filter(t =>
        count >= t.minImages && count <= t.maxImages
    );

    // 2. Score based on tags/style match
    const scoredTemplates = validTemplates.map(t => {
        let score = 0;

        // Base score for simply being valid
        score += 1;

        // Boost if count is in the "sweet spot" (middle of range)
        const range = t.maxImages - t.minImages;
        const sweetSpot = t.minImages + (range / 2);
        const dist = Math.abs(count - sweetSpot);
        if (dist < range / 4) score += 2;

        // Tag matching
        if (tags.length > 0) {
            const lowerTags = tags.map(tag => tag.toLowerCase());

            // Style match
            if (lowerTags.includes(t.style.toLowerCase())) {
                score += 5;
            }

            // Description/Name keyword match
            lowerTags.forEach(tag => {
                if (t.name.toLowerCase().includes(tag) || t.description.toLowerCase().includes(tag)) {
                    score += 3;
                }
            });
        }

        return { template: t, score };
    });

    // 3. Sort by score desc
    scoredTemplates.sort((a, b) => b.score - a.score);

    // Return top 5 or all if fewer
    return scoredTemplates.map(item => item.template);
}

// Re-export specific groups if needed
export { premiumCapaTemplates, creativeCapaTemplates, smartCapaTemplates };
