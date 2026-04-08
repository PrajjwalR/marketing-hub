import { Sparkles, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showBack: boolean;
  onBack: () => void;
}

export default function Header({ showBack, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
      <div className="max-w-[80rem] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              id="btn-back"
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-all duration-300 hover:scale-105"
              aria-label="Back to model selection"
            >
              <ArrowLeft size={18} className="text-zinc-600" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-gold shadow-lg shadow-brand-gold/20">
              <Sparkles size={20} className="text-zinc-900" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-zinc-900">
                AI Studio
              </h1>
              <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-zinc-500">
                Virtual Photoshoot
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-zinc-500">AI Ready</span>
        </div>
      </div>
    </header>
  );
}
