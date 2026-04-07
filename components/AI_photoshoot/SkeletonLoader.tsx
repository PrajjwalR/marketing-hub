export default function SkeletonLoader() {
  const labels = [
    "Variation 1",
    "Variation 2",
    "Variation 3",
    "Variation 4",
    "Variation 5",
    "Variation 6",
    "Variation 7",
    "Variation 8",
    "Variation 9",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl ml-12">
      {labels.map((label) => (
        <div
          key={label}
          className="ai-photoshoot-shimmer-effect bg-zinc-100 border border-zinc-200 rounded-xl aspect-[3/4] flex flex-col items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-200 mb-3" />
          <div className="h-3 w-20 bg-zinc-200 rounded-full" />
          <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mt-3 relative z-10">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
