'use client';

import { cn } from '@/lib/utils';
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Share2,
  ThumbsUp,
  Youtube,
  Linkedin,
  Instagram,
  Facebook,
  Video,
} from 'lucide-react';

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

function getPlatformLabel(platformKey: string): string {
  return PLATFORM_LABELS[platformKey?.toLowerCase()] || 'Post';
}

const PLATFORM_HEADER_STYLES: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  youtube: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900' },
  instagram: { bg: 'bg-gradient-to-r from-rose-50 via-fuchsia-50 to-violet-50', border: 'border-pink-200', icon: 'text-pink-600', text: 'text-zinc-900' },
  linkedin: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'text-sky-600', text: 'text-sky-900' },
  facebook: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
  tiktok: { bg: 'bg-zinc-100', border: 'border-zinc-200', icon: 'text-zinc-900', text: 'text-zinc-900' },
};

function PlatformIcon({ platformKey, className }: { platformKey: string; className?: string }) {
  const key = platformKey?.toLowerCase();
  switch (key) {
    case 'youtube': return <Youtube className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'linkedin': return <Linkedin className={className} />;
    case 'facebook': return <Facebook className={className} />;
    case 'tiktok': return <Video className={className} />;
    default: return <Share2 className={className} />;
  }
}

export function PlatformPreviewCard({
  platformKey,
  whenLabel,
  accountName,
  accountImage,
  title,
  description,
  media,
  density = 'regular',
  onUpload,
  mediaLayout = 'fixed',
  className,
}: {
  platformKey: string;
  whenLabel: string;
  accountName?: string;
  accountImage?: string | null;
  title: string;
  description?: string | null;
  media?: string;
  density?: 'regular' | 'compact';
  onUpload?: () => void;
  mediaLayout?: 'fixed' | 'auto';
  className?: string;
}) {
  const platformLabel = getPlatformLabel(platformKey);
  const key = platformKey?.toLowerCase();
  const headerStyle = PLATFORM_HEADER_STYLES[key] || { bg: 'bg-zinc-50', border: 'border-zinc-200', icon: 'text-zinc-600', text: 'text-zinc-900' };

  return (
    <div className={cn('flex flex-col overflow-hidden', className)}>
      {/* Parent card header: platform name (left) + scheduled time (right) — platform-colored */}
      <div className={cn('flex items-center justify-between gap-2 px-3 py-2 border-b', headerStyle.bg, headerStyle.border)}>
        <div className="flex items-center gap-2 min-w-0">
          <PlatformIcon platformKey={platformKey} className={cn('h-4 w-4 shrink-0', headerStyle.icon)} />
          <span className={cn('text-sm font-bold truncate', headerStyle.text)}>{platformLabel}</span>
        </div>
        <span className={cn('text-xs font-semibold shrink-0', headerStyle.text, 'opacity-80')}>{whenLabel}</span>
      </div>
      {/* Platform-specific preview (how it looks on that platform) — no platform header inside */}
      <PlatformPreview
        platformKey={platformKey}
        whenLabel={whenLabel}
        accountName={accountName}
        accountImage={accountImage}
        title={title}
        description={description}
        media={media}
        density={density}
        onUpload={onUpload}
        mediaLayout={mediaLayout}
        hidePlatformHeader
      />
    </div>
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

function NoMediaPlaceholder({
  label = 'No image',
  aspectClass = 'aspect-video',
  roundedClass = 'rounded-lg',
  onUpload,
}: {
  label?: string;
  aspectClass?: string;
  roundedClass?: string;
  onUpload?: () => void;
}) {
  return (
    <div
      className={cn(
        'mt-2 w-full bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-1 text-center',
        aspectClass,
        roundedClass
      )}
    >
      <div className="text-[10px] text-zinc-400 font-semibold">{label}</div>
      {onUpload && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onUpload();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onUpload();
            }
          }}
          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
        >
          Upload image
        </span>
      )}
    </div>
  );
}

export function PlatformPreview({
  platformKey,
  whenLabel,
  accountName,
  accountImage,
  title,
  description,
  media,
  density = 'regular',
  onUpload,
  mediaLayout = 'fixed',
  hidePlatformHeader = false,
}: {
  platformKey: string;
  whenLabel: string;
  accountName?: string;
  accountImage?: string | null;
  title: string;
  description?: string | null;
  media?: string;
  density?: 'regular' | 'compact';
  onUpload?: () => void;
  mediaLayout?: 'fixed' | 'auto';
  hidePlatformHeader?: boolean;
}) {
  const name = accountName || 'Account';
  const initials = getInitials(name);
  const text = (description || title || '').trim();

  const pad = density === 'compact' ? 'p-1.5' : 'p-2';
  const titleCls =
    density === 'compact'
      ? 'text-[10px] font-black text-zinc-900 line-clamp-2 leading-snug'
      : 'text-[11px] font-black text-zinc-900 line-clamp-2 leading-snug';
  const isAutoMedia = mediaLayout === 'auto';
  const mediaImgClass = isAutoMedia ? 'w-full h-auto object-contain' : 'w-full h-full object-cover';

  if (platformKey === 'youtube') {
    return (
      <div className={pad}>
        {!hidePlatformHeader && (
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500">
              <Youtube className="h-3 w-3 text-red-600" />
              <span className="uppercase tracking-wide">YouTube</span>
            </div>
            <span className="text-[10px] font-black text-zinc-500">{whenLabel}</span>
          </div>
        )}

        {media ? (
          <div
            className={cn(
              "relative w-full rounded-lg overflow-hidden bg-zinc-100",
              !hidePlatformHeader && "mt-2",
              !isAutoMedia && "aspect-video"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media} alt="" className={mediaImgClass} />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white">
              10:40
            </div>
          </div>
        ) : (
          <div className={cn(!hidePlatformHeader && "mt-2")}>
            <NoMediaPlaceholder
              label="No thumbnail"
              aspectClass={isAutoMedia ? "min-h-[120px]" : "aspect-video"}
              roundedClass="rounded-lg"
              onUpload={onUpload}
            />
          </div>
        )}

        <div className={cn("flex items-start gap-2", "mt-2")}>
          {accountImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accountImage} alt="" className="h-7 w-7 rounded-full object-cover bg-zinc-100 shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-700 shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className={titleCls}>{title}</div>
                <div className="text-[10px] text-zinc-500 truncate">{name}</div>
                {!hidePlatformHeader && <div className="text-[9px] text-zinc-400 mt-0.5">Scheduled • {whenLabel}</div>}
              </div>
              <MoreHorizontal className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platformKey === 'linkedin') {
    return (
      <div className={pad}>
        {!hidePlatformHeader && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-500">{whenLabel}</span>
            <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-bold text-sky-800 border border-sky-200">
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </div>
          </div>
        )}

        <div className={cn('flex items-start gap-2', !hidePlatformHeader && 'mt-2')}>
          {accountImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={accountImage} alt="" className="h-7 w-7 rounded-full object-cover bg-zinc-100 shrink-0" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-900 flex items-center justify-center text-[10px] font-black shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-zinc-900 truncate">{name}</div>
                <div className="text-[9px] text-zinc-500 truncate">Scheduled post</div>
              </div>
              <MoreHorizontal className="h-4 w-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        </div>

        <div
          className={cn(
            density === 'compact' ? 'text-[10px]' : 'text-[11px]',
            'text-zinc-800 whitespace-pre-wrap line-clamp-4 leading-snug',
            'mt-2'
          )}
        >
          {text || title}
        </div>

        {media ? (
          <div className={cn("mt-2 w-full rounded-lg overflow-hidden bg-zinc-100", !isAutoMedia && "aspect-video")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media} alt="" className={mediaImgClass} />
          </div>
        ) : (
          <NoMediaPlaceholder
            label="No image"
            aspectClass={isAutoMedia ? "min-h-[120px]" : "aspect-video"}
            roundedClass="rounded-lg"
            onUpload={onUpload}
          />
        )}

        <div className="mt-2 grid grid-cols-4 gap-1 text-[9px] font-semibold text-zinc-500">
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <ThumbsUp className="h-3 w-3" /> Like
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <MessageCircle className="h-3 w-3" /> Comment
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <Repeat2 className="h-3 w-3" /> Repost
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <Send className="h-3 w-3" /> Send
          </div>
        </div>
      </div>
    );
  }

  if (platformKey === 'instagram') {
    return (
      <div className={pad}>
        {!hidePlatformHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {accountImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={accountImage} alt="" className="h-7 w-7 rounded-full object-cover bg-zinc-100 shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-linear-to-br from-rose-500 via-fuchsia-500 to-blue-500 p-px shrink-0">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[10px] font-black text-zinc-900">
                    {initials}
                  </div>
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[11px] font-black text-zinc-900 truncate">{name}</div>
                <div className="text-[9px] text-zinc-500 truncate">Scheduled • {whenLabel}</div>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-zinc-400 shrink-0" />
          </div>
        )}

        {media ? (
          <div className={cn("w-full rounded-lg overflow-hidden bg-zinc-100", !hidePlatformHeader && "mt-2", !isAutoMedia && "aspect-square")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media} alt="" className={mediaImgClass} />
          </div>
        ) : (
          <div className={cn(!hidePlatformHeader && "mt-2")}>
            <NoMediaPlaceholder
              label="No image"
              aspectClass={isAutoMedia ? "min-h-[140px]" : "aspect-square"}
              roundedClass="rounded-lg"
              onUpload={onUpload}
            />
          </div>
        )}

        <div className={cn("flex items-center justify-between text-zinc-700", "mt-2")}>
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" />
            <Send className="h-4 w-4" />
          </div>
          <Bookmark className="h-4 w-4" />
        </div>

        <div className="mt-2 text-[10px] text-zinc-700 whitespace-pre-wrap line-clamp-3 leading-snug">
          <span className="font-black">{name}</span> {text || title}
        </div>
      </div>
    );
  }

  if (platformKey === 'facebook') {
    return (
      <div className={pad}>
        {!hidePlatformHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {accountImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={accountImage} alt="" className="h-7 w-7 rounded-full object-cover bg-zinc-100 shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[11px] font-black text-zinc-900 truncate">{name}</div>
                <div className="text-[9px] text-zinc-500 truncate">Scheduled • {whenLabel}</div>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-zinc-400 shrink-0" />
          </div>
        )}

        <div className={cn("text-[11px] text-zinc-800 whitespace-pre-wrap line-clamp-3 leading-snug", !hidePlatformHeader && "mt-2")}>
          {text || title}
        </div>

        {media ? (
          <div className={cn("mt-2 w-full rounded-lg overflow-hidden bg-zinc-100", !isAutoMedia && "aspect-video")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media} alt="" className={mediaImgClass} />
          </div>
        ) : (
          <NoMediaPlaceholder
            label="No image"
            aspectClass={isAutoMedia ? "min-h-[120px]" : "aspect-video"}
            roundedClass="rounded-lg"
            onUpload={onUpload}
          />
        )}

        <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-semibold text-zinc-500">
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <ThumbsUp className="h-3 w-3" /> Like
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <MessageCircle className="h-3 w-3" /> Comment
          </div>
          <div className="flex items-center justify-center gap-1 rounded-md py-1 hover:bg-zinc-50">
            <Share2 className="h-3 w-3" /> Share
          </div>
        </div>
      </div>
    );
  }

  if (platformKey === 'tiktok') {
    return (
      <div className={pad}>
        {!hidePlatformHeader && (
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-zinc-900" />
              <span className="uppercase tracking-wide">TikTok</span>
            </div>
            <span className="text-[10px] font-black text-zinc-500">{whenLabel}</span>
          </div>
        )}

        <div className={cn("relative w-full rounded-xl overflow-hidden bg-zinc-100", !hidePlatformHeader && "mt-2", !isAutoMedia && "aspect-9/16")}>
          {media ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" className={mediaImgClass} />
          ) : (
            <div className="absolute inset-0">
              <NoMediaPlaceholder label="No video thumbnail" aspectClass="h-full" roundedClass="rounded-none" onUpload={onUpload} />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />

          <div className="absolute right-2 bottom-10 flex flex-col items-center gap-3 text-white">
            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <Heart className="h-4 w-4" />
            </div>
            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <Share2 className="h-4 w-4" />
            </div>
          </div>

          <div className="absolute left-2 right-12 bottom-2 text-white">
            <div className="text-[10px] font-black truncate">@{name.replace(/\s+/g, '').toLowerCase()}</div>
            <div className="text-[9px] leading-snug line-clamp-2 opacity-95">{text || title}</div>
            <div className="mt-1 text-[9px] opacity-80 truncate">♪ Original audio • Scheduled</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pad}>
      {!hidePlatformHeader && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500">{whenLabel}</span>
          <div className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-700 border border-zinc-200">
            <Share2 className="h-3 w-3" />
            Post
          </div>
        </div>
      )}
      <div className={cn(density === 'compact' ? 'text-[10px]' : 'text-[11px]', 'font-black text-zinc-900 line-clamp-2 leading-snug', !hidePlatformHeader && 'mt-2')}>
        {title}
      </div>
      {description && <div className="mt-1 text-[10px] text-zinc-500 line-clamp-3">{description}</div>}
      {media ? (
        <div className={cn("w-full rounded-lg overflow-hidden bg-zinc-100 mt-2", !isAutoMedia && "aspect-video")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media} alt="" className={mediaImgClass} />
        </div>
      ) : (
        <NoMediaPlaceholder
          label="No image"
          aspectClass={isAutoMedia ? "min-h-[120px]" : "aspect-video"}
          roundedClass="rounded-lg"
          onUpload={onUpload}
        />
      )}
    </div>
  );
}

