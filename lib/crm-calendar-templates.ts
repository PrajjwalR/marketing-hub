/**
 * Copy themes for auto-generated CRM postings (manager brief: loyalty / appreciation).
 * Loyalty touchpoints repeat on the same day-of-month every month (e.g. 1st, 14th, 28th).
 */

export type LoyaltyTemplate = {
    /** Day of month (1–31), UTC, when this posting is created */
    dayOfMonth: number;
    title: string;
    description: string;
    color: string;
};

export const MONTHLY_LOYALTY_TEMPLATES: LoyaltyTemplate[] = [
    {
        dayOfMonth: 1,
        title: '🎁 Reward points spotlight',
        description:
            'Your reward points go further this month — check your balance and redeem smart. Thank you for staying engaged with us.',
        color: 'violet',
    },
    {
        dayOfMonth: 14,
        title: '⭐ Valued customer check-in',
        description:
            "You're a valued customer — here's a mid-month thank-you from our team. We appreciate your trust.",
        color: 'violet',
    },
    {
        dayOfMonth: 28,
        title: '💜 Month-end appreciation',
        description:
            'Wrapping the month with gratitude — thanks for your loyalty and for choosing us.',
        color: 'violet',
    },
];

export function birthdayPostingCopy(contactName: string): { title: string; description: string } {
    const name = contactName.trim() || 'Customer';
    return {
        title: `🎂 Birthday: ${name}`,
        description: `Wish ${name} a great birthday. Suggested message: "You're a valued customer — thank you for being with us. Enjoy your special day!"`,
    };
}
