'use client';

import { cn } from "@/lib/utils";

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
    return (
        <div className="flex w-full gap-2 px-1">
            {Array.from({ length: totalSteps }).map((_, i) => {
                const stepNumber = i + 1;
                const isActive = stepNumber <= currentStep;

                return (
                    <div
                        key={i}
                        className={cn(
                            "h-2 flex-1 rounded-full transition-all duration-500 ease-in-out",
                            isActive ? "bg-gradient-to-r from-gold-400 to-gold-500" : "bg-zinc-200"
                        )}
                        aria-hidden="true"
                    />
                );
            })}
        </div>
    );
}
