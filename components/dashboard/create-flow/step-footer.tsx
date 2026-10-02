'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepFooterProps {
    onBack?: () => void;
    onContinue: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    canContinue: boolean;
}

export function StepFooter({
    onBack,
    onContinue,
    isFirstStep,
    isLastStep,
    canContinue
}: StepFooterProps) {
    return (
        <div className="sticky bottom-20 z-30 mx-auto mt-6 flex h-16 max-w-5xl items-center rounded-2xl border border-zinc-200/80 bg-white/95 px-4 shadow-[0_18px_40px_-16px_rgba(17,58,43,0.35)] backdrop-blur md:bottom-4 sm:px-6">
            <div className="flex w-full items-center justify-between">
                <div>
                    {!isFirstStep && (
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="text-zinc-600 hover:text-zinc-900"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    )}
                </div>

                <Button
                    onClick={onContinue}
                    disabled={!canContinue}
                    className="min-w-[140px] bg-gold-400 font-bold text-brand-950 shadow-sm transition-all hover:bg-gold-300 active:scale-95"
                >
                    {isLastStep ? "Schedule" : "Continue"}
                    {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
