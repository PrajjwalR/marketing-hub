'use client';

import { Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FilterOption } from './types';

type FilterBarProps = {
    platform: string;
    goal: string;
    niche: string;
    duration: string;
    platforms: FilterOption[];
    goals: FilterOption[];
    niches: FilterOption[];
    durations: FilterOption[];
    onPlatformChange: (value: string) => void;
    onGoalChange: (value: string) => void;
    onNicheChange: (value: string) => void;
    onDurationChange: (value: string) => void;
};

function FilterSelect({
    value,
    options,
    placeholder,
    onChange,
}: {
    value: string;
    options: FilterOption[];
    placeholder: string;
    onChange: (value: string) => void;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-10 w-full rounded-full border-zinc-200 bg-white text-sm shadow-sm">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function FilterBar({
    platform,
    goal,
    niche,
    duration,
    platforms,
    goals,
    niches,
    durations,
    onPlatformChange,
    onGoalChange,
    onNicheChange,
    onDurationChange,
}: FilterBarProps) {
    return (
        <div className="sticky top-0 z-20 -mx-1 rounded-2xl border border-zinc-200/80 bg-white/90 px-3 py-3 backdrop-blur">
            <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium tracking-wide text-zinc-500">
                <Filter className="h-3.5 w-3.5" />
                Explore strategy combinations
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                    value={platform}
                    options={platforms}
                    placeholder="Platform"
                    onChange={onPlatformChange}
                />
                <FilterSelect value={goal} options={goals} placeholder="Goal" onChange={onGoalChange} />
                <FilterSelect value={niche} options={niches} placeholder="Niche" onChange={onNicheChange} />
                <FilterSelect
                    value={duration}
                    options={durations}
                    placeholder="Duration"
                    onChange={onDurationChange}
                />
            </div>
        </div>
    );
}
