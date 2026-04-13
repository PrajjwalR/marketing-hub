import { Download, Camera } from "lucide-react";

interface ResultGridProps {
  images: (string | { url: string; label: string })[];
}

export default function ResultGrid({ images }: ResultGridProps) {
  const handleDownload = async (url: string, label: string) => {
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
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl ml-12">
      {images.map((img, index) => {
        const url = typeof img === "string" ? img : img.url;
        const label =
          typeof img === "string" ? `Shot ${index + 1}` : img.label;
        return (
          <div
            key={index}
            id={`result-image-${index}`}
            className="group relative rounded-xl overflow-hidden bg-white border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
          >
            <img
              src={url}
              alt={`${label} photoshoot result`}
              className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="ai-photoshoot-result-gradient absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-white/90">
                <Camera size={12} className="text-brand-gold" />
                <span>{label}</span>
              </div>
              <button
                onClick={() => handleDownload(url, label)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                title={`Download ${label}`}
                aria-label={`Download ${label} image`}
              >
                <Download size={14} className="text-white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
