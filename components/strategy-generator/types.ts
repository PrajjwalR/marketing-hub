export type FilterOption = {
    value: string;
    label: string;
};

export type StrategyPreviewDay = {
    day: number;
    idea: string;
};

export type StrategyItem = {
    id: string;
    title: string;
    type: string;
    badge: string;
    description: string;
    inspiredBy: string;
    icon: 'book' | 'flame' | 'users' | 'sparkles' | 'rocket';
    gradient: string;
    preview: StrategyPreviewDay[];
    resultTitle: string;
};
