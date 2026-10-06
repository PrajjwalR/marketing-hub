'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
    Clapperboard,
    FolderPlus,
    Loader2, Video as VideoIcon, Calendar, Film, PlayCircle, Clock, Download, 
    MoreVertical, Trash2, ExternalLink, Copy, Folder, File, Upload, Plus, 
    ChevronRight, Image as ImageIcon, Music, FileText, Search, LayoutGrid, 
    List, ArrowUp, HardDrive, Star, Clock3, Home, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PageHero, heroButtonClass } from '@/components/dashboard/page-hero';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function MediaLibrary() {
    const searchParams = useSearchParams();
    const seriesId = searchParams.get('seriesId');
    
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
    
    const [folders, setFolders] = useState<any[]>([]);
    const [media, setMedia] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewMedia, setPreviewMedia] = useState<any>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchLibrary = async () => {
        try {
            setIsLoading(true);
            const folderId = currentFolder ? currentFolder.id : 'null';
            
            const [foldersRes, mediaRes, videosRes] = await Promise.all([
                fetch(`/api/folders?parentId=${folderId}`),
                fetch(`/api/media?folderId=${folderId}`),
                currentFolder === null ? fetch('/api/videos') : Promise.resolve({ ok: true, json: () => [] }) 
            ]);

            if (foldersRes.ok) setFolders(await foldersRes.json());
            if (mediaRes.ok) setMedia(await mediaRes.json());
            
            if (videosRes.ok && currentFolder === null) {
                let vData = await videosRes.json();
                if (seriesId) {
                    vData = vData.filter((v: any) => v.series_id === seriesId);
                }
                setVideos(vData);
            } else if (currentFolder !== null) {
                setVideos([]);
            }
        } catch (error) {
            console.error("Error fetching library:", error);
            toast.error("Failed to load library");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLibrary();
        
        const interval = setInterval(() => {
            const hasProcessing = videos.some(v => v.status === 'processing');
            if (hasProcessing && currentFolder === null) {
                fetch('/api/videos').then(async res => {
                    if (res.ok) {
                        let vData = await res.json();
                        if (seriesId) vData = vData.filter((v: any) => v.series_id === seriesId);
                        setVideos(vData);
                    }
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [seriesId, currentFolder]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        try {
            const res = await fetch('/api/folders', {
                method: 'POST',
                body: JSON.stringify({ name: newFolderName, parentId: currentFolder?.id || null }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                toast.success("Folder created!");
                setIsCreateFolderOpen(false);
                setNewFolderName('');
                fetchLibrary();
            } else {
                toast.error("Failed to create folder");
            }
        } catch (error) {
            toast.error("Failed to create folder");
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                if (currentFolder) formData.append('folderId', currentFolder.id);

                const res = await fetch('/api/media', {
                    method: 'POST',
                    body: formData
                });
                
                if (!res.ok) {
                    toast.error(`Failed to upload ${file.name}`);
                }
            }
            toast.success("Upload complete!");
            fetchLibrary();
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteFolder = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this folder and its contents?")) return;
        try {
            const res = await fetch(`/api/folders/${id}`, { method: 'DELETE' });
            if (res.ok) { 
                toast.success("Folder deleted"); 
                fetchLibrary(); 
            }
        } catch (e) { toast.error("Failed to delete folder"); }
    };
    
    const handleDeleteMedia = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this file permanently?")) return;
        try {
            const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
            if (res.ok) { 
                toast.success("Media deleted"); 
                fetchLibrary(); 
            }
        } catch (e) { toast.error("Failed to delete media"); }
    };

    const handleDeleteVideo = async (videoId: string) => {
        try {
            const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete video');
            toast.success("Video deleted successfully");
            setVideos(prev => prev.filter(v => v.id !== videoId));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete video");
        }
    };

    // Navigation
    const goToFolder = (folder: any) => {
        setCurrentFolder(folder);
        setBreadcrumbs(prev => [...prev, folder]);
        setSearchQuery('');
    };

    const goUp = (index: number) => {
        if (index === -1) {
            setCurrentFolder(null);
            setBreadcrumbs([]);
        } else {
            const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
            setBreadcrumbs(newBreadcrumbs);
            setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1]);
        }
        setSearchQuery('');
    };

    const goUpOneLevel = () => {
        if (breadcrumbs.length > 0) {
            goUp(breadcrumbs.length - 2);
        }
    };

    // Drag and drop handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredMedia = media.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredVideos = videos.filter(v => (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (type.startsWith('video/')) return <Film className="w-5 h-5 text-purple-500" />;
        if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-orange-500" />;
        return <FileText className="w-5 h-5 text-zinc-500" />;
    };

    return (
        <div className="mx-auto w-full max-w-7xl font-sans">
            <PageHero
                title="Gallery"
                breadcrumb={['Content Creation', 'Gallery']}
                icon={Clapperboard}
                description="Every video, image and file you have created or uploaded, organised in folders."
                stats={[
                    { label: 'Folders', value: folders.length, icon: Folder },
                    { label: 'Videos', value: videos.length, icon: VideoIcon },
                    { label: 'Files', value: media.length, icon: ImageIcon },
                ]}
                actions={
                    <>
                        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                            <DialogTrigger asChild>
                                <button className={heroButtonClass('ghost')}>
                                    <FolderPlus className="h-4 w-4" />
                                    New folder
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New Folder</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Input
                                        placeholder="Folder name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        autoFocus
                                    />
                                </div>
                                <DialogFooter>
                                    <Button disabled={isCreatingFolder || !newFolderName.trim()} onClick={handleCreateFolder}>
                                        {isCreatingFolder ? "Creating..." : "Create"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files)} className="hidden" multiple />
                        <button className={heroButtonClass('gold')} onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Upload
                        </button>
                    </>
                }
            />

            <div className="ae-tile flex h-[72vh] min-h-[480px] flex-col">
                {/* Toolbar: path, search, view toggle */}
                <div className="flex flex-wrap items-center gap-2.5 border-b border-zinc-100 p-3 sm:p-4">
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={goUpOneLevel} disabled={breadcrumbs.length === 0} title="Up one level">
                        <ArrowUp className="h-4 w-4" />
                    </Button>

                    <div className="no-scrollbar flex h-10 min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-xl bg-zinc-50 px-3 text-sm ring-1 ring-zinc-200">
                        <Folder className="h-4 w-4 shrink-0 fill-gold-200 text-gold-600" />
                        <button onClick={() => goUp(-1)} className={cn('ml-1 shrink-0 font-semibold hover:text-brand-700', currentFolder === null ? 'text-brand-800' : 'text-zinc-600')}>
                            Home
                        </button>
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb.id} className="flex shrink-0 items-center">
                                <ChevronRight className="mx-0.5 h-3.5 w-3.5 text-zinc-400" />
                                <button onClick={() => goUp(idx)} className={cn('font-semibold hover:text-brand-700', idx === breadcrumbs.length - 1 ? 'text-brand-800' : 'text-zinc-600')}>
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            placeholder={`Search ${currentFolder ? currentFolder.name : 'Home'}`}
                            className="h-10 rounded-xl pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex rounded-full bg-brand-800 p-1">
                        {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                title={mode === 'grid' ? 'Grid view' : 'List view'}
                                className={cn(
                                    'flex h-8 w-9 items-center justify-center rounded-full transition-all',
                                    viewMode === mode ? 'bg-white text-brand-900 shadow-sm' : 'text-white/75 hover:text-white'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div 
                    className={cn(
                        "flex-1 overflow-y-auto p-4 transition-colors",
                        isDragging && "bg-indigo-50/50 outline-dashed outline-2 outline-indigo-300 -outline-offset-2"
                    )}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {isLoading ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                            <p className="text-zinc-500 text-sm">Working on it...</p>
                        </div>
                    ) : (filteredFolders.length === 0 && filteredMedia.length === 0 && filteredVideos.length === 0) ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold-100"><Folder className="h-9 w-9 fill-gold-200 text-gold-600" /></span>
                            <p className="font-display text-xl font-semibold text-zinc-900">This folder is empty</p><p className="mt-1 text-sm text-zinc-500">Upload files or drop them here.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <>
                                    {filteredFolders.length > 0 && (
                                        <div>
                                            {searchQuery === '' && <h3 className="ae-section-label mb-3">Folders</h3>}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                                {filteredFolders.map(folder => (
                                                    <div 
                                                        key={folder.id} 
                                                        onClick={() => goToFolder(folder)}
                                                        className="group relative flex cursor-pointer flex-col items-center rounded-2xl border border-zinc-200/80 bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                                                    >
                                                        <Folder className="w-16 h-16 text-amber-400 fill-amber-400/30 mb-2" strokeWidth={1.5} />
                                                        <span className="text-sm text-zinc-800 font-medium truncate w-full px-1">{folder.name}</span>
                                                        
                                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                    <button className="p-1 rounded bg-white/80 shadow-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600">
                                                                        <MoreVertical className="w-3 h-3" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={(e) => handleDeleteFolder(folder.id, e)} className="text-red-600">
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {filteredMedia.length > 0 && (
                                        <div className={cn(filteredFolders.length > 0 && "mt-6")}>
                                            {searchQuery === '' && <h3 className="ae-section-label mb-3">Files</h3>}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                                {filteredMedia.map(asset => (
                                                    <div key={asset.id} className="group border border-zinc-200 rounded-md overflow-hidden bg-white hover:border-indigo-300 hover:shadow-sm transition-all relative cursor-pointer" onClick={() => setPreviewMedia(asset)}>
                                                        <div className="aspect-square bg-[#f8f9fa] border-b border-zinc-100 flex items-center justify-center relative p-2">
                                                            {asset.type.startsWith('image/') ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={asset.url} alt={asset.name} className="h-full w-full object-contain p-2" />
                                                            ) : asset.type.startsWith('video/') ? (
                                                                <div className="w-full h-full relative flex items-center justify-center bg-black/5">
                                                                    <VideoIcon className="w-8 h-8 text-zinc-400" />
                                                                </div>
                                                            ) : (
                                                                <FileText className="w-12 h-12 text-zinc-300" strokeWidth={1} />
                                                            )}
                                                        </div>
                                                        <div className="p-2 bg-white flex items-center gap-2">
                                                            {getFileIcon(asset.type)}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium text-zinc-800 truncate" title={asset.name}>{asset.name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); window.open(asset.url, '_blank'); }}
                                                                className="p-1 rounded bg-white/90 shadow-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                    <button className="p-1 rounded bg-white/90 shadow-sm border border-zinc-200 hover:bg-zinc-50 text-zinc-600">
                                                                        <MoreVertical className="w-3 h-3" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={asset.url} download target="_blank" rel="noopener noreferrer">
                                                                            <Download className="w-4 h-4 mr-2" /> Download
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(asset.url); toast.success("Copied to clipboard"); }}>
                                                                        <Copy className="w-4 h-4 mr-2" /> Copy link
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={(e) => handleDeleteMedia(asset.id, e)} className="text-red-600">
                                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Legacy Generated Videos View (Tiles) */}
                                    {filteredVideos.length > 0 && currentFolder === null && (
                                        <div className={cn((filteredFolders.length > 0 || filteredMedia.length > 0) && "mt-8")}>
                                            {searchQuery === '' && <h3 className="ae-section-label mb-3">Generated Videos</h3>}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {filteredVideos.map((video) => (
                                                    <VideoExplorerItem key={video.id} video={video} onDelete={handleDeleteVideo} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-200">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Name</th>
                                                <th className="px-4 py-2 font-medium">Date modified</th>
                                                <th className="px-4 py-2 font-medium">Type</th>
                                                <th className="px-4 py-2 font-medium">Size</th>
                                                <th className="px-4 py-2 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {filteredFolders.map(folder => (
                                                <tr key={folder.id} className="hover:bg-zinc-50 group cursor-pointer" onClick={() => goToFolder(folder)}>
                                                    <td className="px-4 py-2.5 flex items-center gap-3">
                                                        <Folder className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                                                        <span className="font-medium text-zinc-800">{folder.name}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-zinc-500">{format(new Date(folder.created_at), 'MMM dd, yyyy HH:mm')}</td>
                                                    <td className="px-4 py-2.5 text-zinc-500">File folder</td>
                                                    <td className="px-4 py-2.5 text-zinc-500"></td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => handleDeleteFolder(folder.id, e)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredMedia.map(asset => (
                                                <tr key={asset.id} className="hover:bg-zinc-50 group cursor-pointer" onClick={() => setPreviewMedia(asset)}>
                                                    <td className="px-4 py-2.5 flex items-center gap-3">
                                                        {getFileIcon(asset.type)}
                                                        <span className="text-zinc-800 truncate max-w-[300px]" title={asset.name}>{asset.name}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-zinc-500">{format(new Date(asset.created_at), 'MMM dd, yyyy HH:mm')}</td>
                                                    <td className="px-4 py-2.5 text-zinc-500 truncate max-w-[150px]">{asset.type}</td>
                                                    <td className="px-4 py-2.5 text-zinc-500">{formatSize(asset.size)}</td>
                                                    <td className="px-4 py-2.5 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); window.open(asset.url, '_blank'); }}>
                                                            <ExternalLink className="w-4 h-4 text-zinc-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDeleteMedia(asset.id, e)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Legacy Videos as List items */}
                                            {filteredVideos.map((video) => (
                                                <tr key={video.id} className="hover:bg-zinc-50 group">
                                                    <td className="px-4 py-2.5 flex items-center gap-3">
                                                        <VideoIcon className="w-5 h-5 text-indigo-500" />
                                                        <span className="text-zinc-800 font-medium truncate max-w-[300px]">{video.title || 'Untitled Video'}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5 py-0">Generated</Badge>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-zinc-500">{format(new Date(video.created_at), 'MMM dd, yyyy HH:mm')}</td>
                                                    <td className="px-4 py-2.5 text-zinc-500">Agent Elephant Video</td>
                                                    <td className="px-4 py-2.5 text-zinc-500">-</td>
                                                    <td className="px-4 py-2.5 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                                                        {video.video_url && (
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(video.video_url, '_blank')}>
                                                                <PlayCircle className="w-4 h-4 text-indigo-500" />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteVideo(video.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Status Bar */}
                <div className="flex shrink-0 items-center justify-between rounded-b-2xl border-t border-zinc-100 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-500">
                    <div className="flex gap-4">
                        <span>{filteredFolders.length + filteredMedia.length + filteredVideos.length} items</span>
                        {isUploading && <span className="flex items-center gap-1 text-indigo-600"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>}
                    </div>
                    <div>
                        {currentFolder ? 'Directory View' : 'Root Directory'}
                    </div>
                </div>

            </div>

            {/* Media Preview Dialog */}
            <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-zinc-800">
                    <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent border-none">
                        <DialogTitle className="text-white flex items-center gap-2">
                            {previewMedia && getFileIcon(previewMedia.type)}
                            <span className="truncate">{previewMedia?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-[80vh] flex items-center justify-center relative bg-black">
                        {previewMedia?.type?.startsWith('image/') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewMedia.url} alt={previewMedia.name} className="h-full w-full object-contain" />
                        ) : previewMedia?.type?.startsWith('video/') ? (
                            <video src={previewMedia.url} controls autoPlay className="w-full h-full object-contain" />
                        ) : previewMedia?.type?.startsWith('audio/') ? (
                            <div className="flex flex-col items-center gap-6 w-full max-w-md p-8 bg-zinc-900 rounded-2xl">
                                <Music className="w-24 h-24 text-indigo-500" />
                                <audio src={previewMedia.url} controls autoPlay className="w-full" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-white">
                                <FileText className="w-24 h-24 text-zinc-500" />
                                <p>No preview available for this file type.</p>
                                <Button onClick={() => window.open(previewMedia?.url, '_blank')} variant="secondary">
                                    Open in new tab
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Compact Video item for grid view
function VideoExplorerItem({ video, onDelete }: { video: any; onDelete: (id: string) => Promise<void> }) {
    const thumbnail = video.images?.[0]?.url || video.series?.video_style_image || '/placeholder-thumb.png';
    const isReady = video.status === 'ready';

    return (
        <div className="ae-tile ae-tile-interactive group">
            <div className="aspect-video relative bg-zinc-100">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={thumbnail} alt="thumb" className="h-full w-full object-cover opacity-80" />
                 {isReady && video.video_url ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <PlayCircle className="w-10 h-10 text-white drop-shadow-md" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0 border-0 bg-black">
                             <video src={video.video_url} controls autoPlay className="w-full h-full" />
                        </DialogContent>
                    </Dialog>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                         <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                 )}
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <button className="p-1.5 rounded bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm">
                                  <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                             {isReady && video.video_url && (
                                 <>
                                     <DropdownMenuItem onClick={() => window.open(video.video_url, '_blank')}><ExternalLink className="w-4 h-4 mr-2"/> Open</DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(video.video_url); toast.success("Copied"); }}><Copy className="w-4 h-4 mr-2"/> Copy URL</DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                 </>
                             )}
                             <DropdownMenuItem onClick={() => onDelete(video.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                         </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
            </div>
            <div className="p-2.5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                    <VideoIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <p className="text-xs font-semibold text-zinc-800 truncate">{video.title || "Untitled Video"}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={cn("text-[9px] h-4 py-0 px-1", isReady ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-indigo-200 text-indigo-700 bg-indigo-50")}>
                        {video.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-400 font-medium">{format(new Date(video.created_at), 'MMM dd, yy')}</span>
                </div>
            </div>
        </div>
    );
}

export default function VideosPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                <p className="text-zinc-500 text-sm">Opening Explorer...</p>
            </div>
        }>
            <MediaLibrary />
        </Suspense>
    );
}
