import { Sparkles, ArrowLeft, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { HubTabs, useCurrentHub } from '@/components/dashboard/hub-nav';

interface HeaderProps {
  showBack: boolean;
  onBack: () => void;
}

export default function Header({ showBack, onBack }: HeaderProps) {
  const hub = useCurrentHub();
  const showSubTabs = !!hub && hub.apps.length >= 2;
  return (
    <header className="ae-hero ae-contour ae-contour-dark relative z-20 -mx-4 px-5 py-6 sm:-mx-5 sm:px-8 md:mx-0 md:rounded-[24px]">
      {showSubTabs ? <HubTabs className="mb-4" /> : (
      <nav aria-label="Breadcrumb" className="relative mb-4 flex items-center gap-1.5 text-xs font-semibold text-white/55">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-white">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-white/35" />
        <span>AI Photoshoot</span>
        <ChevronRight className="h-3 w-3 text-white/35" />
        <span className="text-gold-300">Studio</span>
      </nav>
      )}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              id="btn-back"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white transition-colors hover:bg-white/10"
              aria-label="Back to model selection"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_25%,#fff7dc_0%,#f9c02a_45%,#c98009_100%)] text-brand-950 shadow-[inset_0_-3px_0_rgba(109,60,18,0.35),inset_0_2px_0_rgba(255,255,255,0.6)] sm:flex">
            <Sparkles size={24} />
          </span>
          <div>
            <h1 className="text-[28px] leading-tight text-white sm:text-4xl">AI Studio</h1>
            <p className="mt-1 text-sm text-white/70">Virtual photoshoot: studio-grade product shots on real models.</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 sm:flex">
          <div className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
          <span className="text-xs font-bold text-white">AI Ready</span>
        </div>
      </div>
    </header>
  );
}
