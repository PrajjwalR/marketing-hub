'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { app } from "@/lib/firebase";

export interface HeroSlot {
  id: string;
  time: string;
  hours: [number, number];
  place: string;
  business: string;
  status: string;
  src: string;
  poster: string;
}

const HERO_SLOTS: HeroSlot[] = [
  {
    id: "01-dawn-cafe",
    time: "2h ago",
    hours: [5, 8],
    place: "Indiranagar, Bengaluru",
    business: "Specialty café",
    status: "Opening up · today's Reel already posted",
    src: "/assets/hero-24-7/01-dawn-cafe.mp4",
    poster: "/assets/hero-24-7/01-dawn-cafe.webp",
  },
  {
    id: "02-textile-shop",
    time: "09:30",
    hours: [8, 11],
    place: "Johari Bazaar, Jaipur",
    business: "Block-print textile shop",
    status: "New stock in · photoshoot done before the shutter went up",
    src: "/assets/hero-24-7/02-textile-shop.mp4",
    poster: "/assets/hero-24-7/02-textile-shop.webp",
  },
  {
    id: "03-kitchen-pass",
    time: "12:00",
    hours: [11, 14],
    place: "Fort, Mumbai",
    business: "Family restaurant",
    status: "Lunch rush · 3 WhatsApp orders answered",
    src: "/assets/hero-24-7/03-kitchen-pass.mp4",
    poster: "/assets/hero-24-7/03-kitchen-pass.webp",
  },
  {
    id: "04-salon",
    time: "15:00",
    hours: [14, 16],
    place: "Jubilee Hills, Hyderabad",
    business: "Salon",
    status: "#1 on Maps for “salon near me”",
    src: "/assets/hero-24-7/04-salon.mp4",
    poster: "/assets/hero-24-7/04-salon.webp",
  },
  {
    id: "09-d2c-beauty",
    time: "16:30",
    hours: [16, 18],
    place: "Bandra, Mumbai",
    business: "D2C skincare brand",
    status: "Photoshoot done by Agent Elephant · 12 posts scheduled",
    src: "/assets/hero-24-7/09-d2c-beauty.mp4",
    poster: "/assets/hero-24-7/09-d2c-beauty.webp",
  },
  {
    id: "05-jewellery",
    time: "18:30",
    hours: [18, 20],
    place: "Ring Road, Surat",
    business: "Jewellery showroom",
    status: "Instagram ad live · 11 enquiries today",
    src: "/assets/hero-24-7/05-jewellery.mp4",
    poster: "/assets/hero-24-7/05-jewellery.webp",
  },
  {
    id: "06-sweet-shop-rain",
    time: "21:30",
    hours: [20, 22],
    place: "Bhowanipore, Kolkata",
    business: "Mithai shop",
    status: "New 5★ review · replied automatically",
    src: "/assets/hero-24-7/06-sweet-shop-rain.mp4",
    poster: "/assets/hero-24-7/06-sweet-shop-rain.webp",
  },
  {
    id: "08-marketplace-seller",
    time: "22:30",
    hours: [22, 23],
    place: "Karol Bagh, Delhi",
    business: "Marketplace seller",
    status: "Listings shot · 40 orders packed tonight",
    src: "/assets/hero-24-7/08-marketplace-seller.mp4",
    poster: "/assets/hero-24-7/08-marketplace-seller.webp",
  },
  {
    id: "07-cloud-kitchen",
    time: "00:30",
    hours: [23, 5],
    place: "Sector 29, Gurugram",
    business: "Cloud kitchen",
    status: "DM answered · order booked while the owner sleeps",
    src: "/assets/hero-24-7/07-cloud-kitchen.mp4",
    poster: "/assets/hero-24-7/07-cloud-kitchen.webp",
  },
];

const TICKER_LOGOS = [
  { name: "aquirasglobal.com", src: "/assets/hero-24-7/ticker/aquirasglobal-com.png", w: 94, h: 56 },
  { name: "RMC CREATIONS", src: "/assets/hero-24-7/ticker/rmc-creations.png", w: 49, h: 56 },
  { name: "De cove cafe", src: "/assets/hero-24-7/ticker/de-cove-cafe.png", w: 75, h: 56 },
  { name: "Rajputesta", src: "/assets/hero-24-7/ticker/rajputesta.png", w: 56, h: 56 },
  { name: "Star Rail", src: "/assets/hero-24-7/ticker/star-rail.png", w: 74, h: 56 },
  { name: "Dream Space Infra Developers", src: "/assets/hero-24-7/ticker/dream-space-infra-developers.png", w: 55, h: 56 },
  { name: "Durga Agencies", src: "/assets/hero-24-7/ticker/durga-agencies.png", w: 61, h: 56 },
  { name: "INDIAN WIRE HOUSE", src: "/assets/hero-24-7/ticker/indian-wire-house.png", w: 73, h: 56 },
  { name: "Blumart Online Shopping", src: "/assets/hero-24-7/ticker/blumart-online-shopping.png", w: 171, h: 56 },
  { name: "Face Value Dental", src: "/assets/hero-24-7/ticker/face-value-dental-implant-ce.png", w: 59, h: 56 },
  { name: "Look Optical", src: "/assets/hero-24-7/ticker/look-optical.png", w: 103, h: 56 },
  { name: "Hotel Mirage", src: "/assets/hero-24-7/ticker/hotel-mirage.png", w: 71, h: 56 },
  { name: "FEA Glam", src: "/assets/hero-24-7/ticker/fea-glam.png", w: 105, h: 56 },
  { name: "Rozveda", src: "/assets/hero-24-7/ticker/rozveda.png", w: 75, h: 56 },
  { name: "ARV herbal tea", src: "/assets/hero-24-7/ticker/arv-herbal-tea.png", w: 140, h: 56 },
  { name: "Robots tattoo", src: "/assets/hero-24-7/ticker/robots-tattoo-best-tattoo-st.png", w: 41, h: 56 },
  { name: "YARD ESSENTIALS", src: "/assets/hero-24-7/ticker/yard-essentials.png", w: 115, h: 56 },
  { name: "URZFASHION", src: "/assets/hero-24-7/ticker/urzfashion.png", w: 134, h: 56 },
  { name: "Krishnas Sweta", src: "/assets/hero-24-7/ticker/krishnas-sweta.png", w: 65, h: 56 },
  { name: "Hanna & Zainy", src: "/assets/hero-24-7/ticker/hanna-zainy.png", w: 65, h: 56 },
  { name: "Job Avanta HR", src: "/assets/hero-24-7/ticker/job-avanta-hr-solution.png", w: 59, h: 56 },
  { name: "Careerdisha", src: "/assets/hero-24-7/ticker/careerdisha.png", w: 100, h: 56 },
  { name: "DK Driving School", src: "/assets/hero-24-7/ticker/dk-driving-school.png", w: 49, h: 56 },
  { name: "Comfort Tours", src: "/assets/hero-24-7/ticker/comfort-tours-and-travels.png", w: 59, h: 56 },
  { name: "VINDYAA INFRAA", src: "/assets/hero-24-7/ticker/vindyaa-infraa-india-pvt-ltd.png", w: 106, h: 56 },
  { name: "Siddhant Logistics", src: "/assets/hero-24-7/ticker/siddhant-logistics.png", w: 54, h: 56 },
  { name: "AMUKTA AGRO", src: "/assets/hero-24-7/ticker/amukta-agro-traders.png", w: 85, h: 56 },
  { name: "rajkamal traders", src: "/assets/hero-24-7/ticker/rajkamal-traders.png", w: 73, h: 56 },
  { name: "The hamper studio", src: "/assets/hero-24-7/ticker/the-hamper-studio.png", w: 55, h: 56 },
  { name: "Athrav Agricure", src: "/assets/hero-24-7/ticker/athrav-agricure-pvt-ltd.png", w: 75, h: 56 },
  { name: "G.Y.HAKIM", src: "/assets/hero-24-7/ticker/g-y-hakim.png", w: 64, h: 56 },
  { name: "V-Insure", src: "/assets/hero-24-7/ticker/v-insure.png", w: 205, h: 56 },
];

function getInitialSlotIndex(): number {
  if (typeof window === "undefined") return 5;
  const urlParam = new URLSearchParams(window.location.search).get("hour");
  const parsedHour = urlParam ? parseInt(urlParam, 10) : NaN;
  const hour = !isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24 ? parsedHour : new Date().getHours();

  for (let i = 0; i < HERO_SLOTS.length; i++) {
    const [start, end] = HERO_SLOTS[i].hours;
    if (start <= end) {
      if (hour >= start && hour < end) return i;
    } else {
      if (hour >= start || hour < end) return i;
    }
  }
  return 5;
}

export function Hero() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSlot, setActiveSlot] = useState(5);
  const [hasMounted, setHasMounted] = useState(false);
  const [liveClockTime, setLiveClockTime] = useState("");
  const [currentHour, setCurrentHour] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressBarRef = useRef<HTMLElement | null>(null);

  // Auth state
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoaded(true);
    });
    return () => unsub();
  }, []);

  // Time & initialization
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const initialIdx = getInitialSlotIndex();
    setActiveSlot(initialIdx);
    setHasMounted(true);

    const updateClock = () => {
      const now = new Date();
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      setLiveClockTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
      setCurrentHour(now.getHours());
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 15000);

    return () => clearInterval(clockInterval);
  }, []);

  // Video playback & timeline animation
  useEffect(() => {
    if (!hasMounted || reducedMotion) return;

    const total = HERO_SLOTS.length;
    const vElements = videoRefs.current;

    const loadVideoSrc = (idx: number) => {
      const v = vElements[idx];
      if (v && !v.getAttribute("src")) {
        v.setAttribute("src", HERO_SLOTS[idx].src);
        v.load();
      }
    };

    const startPlaying = (idx: number) => {
      const v = vElements[idx];
      if (v) {
        loadVideoSrc(idx);
        if (v.currentTime > 0.5) v.currentTime = 0;
        v.play().catch(() => {});
      }
    };

    startPlaying(activeSlot);

    // Preload next video in advance
    const nextIdx = (activeSlot + 1) % total;
    const preloadTimer = setTimeout(() => loadVideoSrc(nextIdx), 1000);

    // Pause previous video smoothly
    const prevIdx = (activeSlot - 1 + total) % total;
    const pauseTimer = setTimeout(() => {
      vElements[prevIdx]?.pause();
    }, 1500);

    let rafId = 0;
    let switched = false;
    const startTime = performance.now();

    const loop = () => {
      const currentVideo = vElements[activeSlot];
      const bar = progressBarRef.current;

      const duration = Math.max(
        (currentVideo && Number.isFinite(currentVideo.duration) && currentVideo.duration > 0
          ? currentVideo.duration
          : 9) - 1.4,
        1
      );

      const elapsed = currentVideo && currentVideo.currentTime > 0
        ? currentVideo.currentTime
        : (performance.now() - startTime) / 1000;

      const progress = Math.min(elapsed / duration, 1);

      if (bar) {
        bar.style.transform = `scaleX(${progress})`;
      }

      const isTimedOut = (performance.now() - startTime) / 1000 > duration + 3;

      if (!switched && (progress >= 1 || isTimedOut)) {
        switched = true;
        startPlaying(nextIdx);
        setActiveSlot(nextIdx);
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPlaying(activeSlot);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(preloadTimer);
      clearTimeout(pauseTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activeSlot, hasMounted, reducedMotion]);

  const handleSlotSelect = useCallback((idx: number) => {
    setActiveSlot(idx);
    const video = videoRefs.current[idx];
    if (video) {
      if (!video.getAttribute("src")) {
        video.setAttribute("src", HERO_SLOTS[idx].src);
        video.load();
      }
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }, []);

  const currentSlot = HERO_SLOTS[activeSlot] ?? HERO_SLOTS[0];
  const isCurrentTimeSlot =
    currentHour !== null &&
    activeSlot === HERO_SLOTS.findIndex((slot) => {
      const [start, end] = slot.hours;
      return start <= end
        ? currentHour >= start && currentHour < end
        : currentHour >= start || currentHour < end;
    });

  const displayTime = isCurrentTimeSlot && liveClockTime ? liveClockTime : currentSlot.time;
  const clockLabel = `At ${displayTime} · ${currentSlot.place}`;

  return (
    <section className="ns-hero" aria-label="Run marketing 24/7">
      <div className="ns-hero-stage">
        {/* Background Videos with Crossfade */}
        <div className="ns-hero-media" aria-hidden="true">
          {reducedMotion ? (
            <img
              src={currentSlot.poster}
              alt=""
              className="is-on"
            />
          ) : (
            HERO_SLOTS.map((slot, idx) => (
              <video
                key={slot.id}
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                poster={slot.poster}
                muted
                loop
                playsInline
                preload="none"
                className={idx === activeSlot ? "is-on" : undefined}
              />
            ))
          )}
        </div>

        {/* Film Grain & Dark Atmospheric Gradients */}
        <div className="ns-hero-grain" aria-hidden="true" />
        <div className="ns-hero-fade" aria-hidden="true" />

        {/* Hero Content */}
        <div className="ns-hero-copy">
          <div className="ns-hero-text">
            <h1 className="ns-h1">
              <span>
                <span className="w" style={{ animationDelay: "0ms" }}>Run</span>{" "}
              </span>
              <span>
                <span className="w" style={{ animationDelay: "70ms" }}>marketing</span>
              </span>
              <br />
              <span className="w" style={{ animationDelay: "140ms" }}>
                24<span className="slash">/</span>7.
              </span>
            </h1>

            <p className="ns-sub">
              Agent Elephant grows your business online — posting, answering and advertising for you, while you run the business.
            </p>

            <div className="ns-ctas">
              {isLoaded && !user ? (
                <Link href="/sign-up" className="ns-btn primary">
                  Get the app
                </Link>
              ) : isLoaded && user ? (
                <Link href="/dashboard" className="ns-btn primary">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/sign-up" className="ns-btn primary">
                  Get the app
                </Link>
              )}

              <a
                className="ns-btn ghost"
                href="https://web.scalio.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                Use on web
              </a>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="ns-clock" aria-live="polite">
            <span className="mono">{clockLabel}</span>
            <span className="time">{displayTime}</span>
            <span className="status">
              <b>{currentSlot.business}</b> · {currentSlot.status}
            </span>

            {/* Segmented Timeline Bars */}
            <div className="ns-day" aria-hidden="true">
              {HERO_SLOTS.map((slot, idx) => (
                <i
                  key={slot.id}
                  className={idx === activeSlot ? "on" : undefined}
                  onClick={() => handleSlotSelect(idx)}
                  title={`${slot.business} (${slot.time})`}
                >
                  {idx === activeSlot && <b ref={progressBarRef} />}
                </i>
              ))}
            </div>
          </div>
        </div>

        {/* Continuous Infinite Marquee Ticker */}
        <div className="ns-ticker" aria-label="Over 10K businesses use Agent Elephant">
          <div className="label">
            <span className="mono">Over 10K businesses use Agent Elephant</span>
          </div>
          <div className="marquee">
            <div className="track">
              {[...TICKER_LOGOS, ...TICKER_LOGOS].map((logo, idx) => (
                <img
                  key={`${logo.name}-${idx}`}
                  className="tlogo"
                  alt={logo.name}
                  title={logo.name}
                  width={logo.w}
                  height={logo.h}
                  loading="lazy"
                  decoding="async"
                  src={logo.src}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
