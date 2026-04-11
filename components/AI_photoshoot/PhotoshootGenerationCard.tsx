import Link from "next/link";
import { Download } from "lucide-react";

export function formatFileTitleFromLabel(label: string, index = 0): string {
  const base = label.trim() || `variation_${index + 1}`;
  const slug = base
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toUpperCase();
  return `${slug || `SHOT_${index + 1}`}.JPG`;
}

const CARD_CLASS =
  "group flex flex-col overflow-hidden rounded-lg border border-zinc-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#E0B428] hover:shadow-md hover:ring-1 hover:ring-[#F5C842]/80";

type PhotoshootGenerationCardProps = {
  href?: string;
  imageUrl: string | null;
  fileTitle: string;
  headline: string;
  description: string;
  tags: string;
  /** Session list: show count badge on thumbnail */
  imageCountBadge?: number;
  /** Detail view: optional download */
  downloadUrl?: string;
  downloadLabel?: string;
};

async function downloadImage(url: string, label: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${label.toLowerCase().replace(/\s+/g, "-")}-photoshoot.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

function CardBody({
  imageUrl,
  fileTitle,
  headline,
  description,
  tags,
  imageCountBadge,
  downloadUrl,
  downloadLabel,
}: Omit<PhotoshootGenerationCardProps, "href">) {
  return (
    <>
      <div className="relative h-36 w-full shrink-0 overflow-hidden bg-zinc-100 sm:h-40">
        {typeof imageCountBadge === "number" && imageCountBadge > 1 && (
          <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-zinc-900/85 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            {imageCountBadge}
          </span>
        )}
        {downloadUrl && downloadLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void downloadImage(downloadUrl, downloadLabel);
            }}
            className="absolute bottom-1.5 right-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/90 bg-white/95 text-zinc-700 shadow-sm opacity-0 backdrop-blur-sm transition-opacity hover:bg-[#F5C842] group-hover:opacity-100"
            title={`Download ${downloadLabel}`}
            aria-label={`Download ${downloadLabel}`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
            No preview
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 p-2.5">
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#EA580C]">
          {fileTitle}
        </p>
        <p className="line-clamp-2 text-xs font-bold leading-snug text-zinc-900">
          {headline}
        </p>
        <p className="line-clamp-2 text-[11px] leading-snug text-zinc-600">
          {description}
        </p>
        <p className="mt-auto truncate pt-0.5 text-[10px] italic text-zinc-500">
          {tags}
        </p>
      </div>
    </>
  );
}

export function PhotoshootGenerationCard({
  href,
  imageUrl,
  fileTitle,
  headline,
  description,
  tags,
  imageCountBadge,
  downloadUrl,
  downloadLabel,
}: PhotoshootGenerationCardProps) {
  const body = (
    <CardBody
      imageUrl={imageUrl}
      fileTitle={fileTitle}
      headline={headline}
      description={description}
      tags={tags}
      imageCountBadge={imageCountBadge}
      downloadUrl={downloadUrl}
      downloadLabel={downloadLabel}
    />
  );

  if (href) {
    return (
      <Link href={href} className={CARD_CLASS}>
        {body}
      </Link>
    );
  }

  return <div className={CARD_CLASS}>{body}</div>;
}

/** Same grid as the generations list page */
export const PHOTOSHOOT_GENERATIONS_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";
