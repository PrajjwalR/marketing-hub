import { Check, UserRound, Gem, Upload, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudioHowItWorksPhase = "select-model" | "configure-generate";

const STEPS = [
  {
    n: 1,
    title: "Select a model",
    description: "Choose the model canvas that fits your brand look.",
    Icon: UserRound,
  },
  {
    n: 2,
    title: "Pick jewelry type",
    description: "Ring, necklace, earring, bracelet, or anklet.",
    Icon: Gem,
  },
  {
    n: 3,
    title: "Upload your image",
    description: "Add a clear, well-lit photo of your jewelry piece.",
    Icon: Upload,
  },
  {
    n: 4,
    title: "Generate",
    description: "Use the generate button to run the AI photoshoot.",
    Icon: Sparkles,
  },
] as const;

type StudioHowItWorksProps = {
  phase: StudioHowItWorksPhase;
};

export default function StudioHowItWorks({ phase }: StudioHowItWorksProps) {
  return (
    <section
      className="border-b border-zinc-200/90 bg-[#F5F0E8]"
      aria-labelledby="studio-how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Quick guide
          </p>
          <h2
            id="studio-how-it-works-heading"
            className="mt-2 text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl"
          >
            How to generate your images
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Follow these steps in order — you&apos;ll select a model first, then
            set type and upload, then generate.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {STEPS.map((step) => {
            const { Icon } = step;
            const isStep1Done = phase === "configure-generate" && step.n === 1;
            const isActiveSelect =
              phase === "select-model" && step.n === 1;
            const isActiveConfigure =
              phase === "configure-generate" && step.n >= 2;
            const isHighlighted =
              isActiveSelect || isActiveConfigure || isStep1Done;

            return (
              <li key={step.n} className="flex gap-3 lg:flex-col lg:items-center lg:text-center">
                <div className="relative z-1 flex shrink-0 lg:mb-2">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black tabular-nums transition-colors",
                      isStep1Done &&
                        "border-emerald-600 bg-emerald-600 text-white",
                      !isStep1Done &&
                        isHighlighted &&
                        "border-[#E0B428] bg-[#F5C842] text-zinc-900",
                      !isStep1Done &&
                        !isHighlighted &&
                        "border-zinc-300 bg-white text-zinc-500"
                    )}
                  >
                    {isStep1Done ? (
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                    ) : (
                      step.n
                    )}
                  </span>
                </div>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border p-3 transition-colors lg:text-center",
                    isHighlighted && !isStep1Done
                      ? "border-[#E0B428]/60 bg-white shadow-sm"
                      : isStep1Done
                        ? "border-emerald-200/80 bg-white/80"
                        : "border-zinc-200/80 bg-white/60"
                  )}
                >
                  <div className="mb-1 flex items-center gap-2 lg:justify-center">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isHighlighted ? "text-[#EA580C]" : "text-zinc-400"
                      )}
                    />
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-800">
                      Step {step.n}
                    </span>
                  </div>
                  <p className="font-semibold leading-snug text-zinc-900">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
