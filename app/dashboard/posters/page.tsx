import { PostersPageClient } from '@/components/posters/posters-page-client';

export default function PostersPage() {
    const [activeTab, setActiveTab] = useState<TabType>('image');
    return (
        <div className="space-y-3 w-full max-w-7xl mx-auto">
            <div className="bg-white p-4 rounded-[10px] border border-zinc-200 shadow-sm">
                <div className="space-y-2">
                    <div id="posters-header" className="space-y-0.5">
                        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
                            Posters
                        </h1>
                        <p className="text-base leading-relaxed text-zinc-500 max-w-2xl">
                        Describe what you want to generate. We’ll turn it into a powerful prompt and produce the final content.
                    </p>
                    </div>
                    <div id="posters-tabs" className="flex gap-2 p-1 rounded-lg bg-zinc-100 w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab('image')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                activeTab === 'image' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                            )}
                        >
                            <ImageIcon className="h-4 w-4" />
                            Image
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('video')}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                activeTab === 'video' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                            )}
                        >
                            <Film className="h-4 w-4" />
                            Video
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'image' ? (
                <PostersWorkbench
                    type="image"
                    title="Image Editing"
                    subtitle="Upload an image, describe your edit, and generate a new poster-ready result."
                />
            ) : (
                <PostersWorkbench
                    type="video"
                    title="Video Generation"
                    subtitle="Turn an idea into a short video concept with the right format and motion direction."
                />
            )}
        </div>
    );
}
