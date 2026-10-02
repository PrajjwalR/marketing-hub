'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Clock, 
  Loader2,
  LayoutGrid,
  Palette,
  Search,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHero, SectionHeader, heroButtonClass } from '@/components/dashboard/page-hero';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { cn } from '@/lib/utils';

interface Design {
  id: string;
  name: string;
  preview_url: string | null;
  updated_at: string;
  width: number;
  height: number;
}

interface Template {
  id: string;
  name: string;
  thumbnail_url: string | null;
  preview_url?: string | null;
  width: number;
  height: number;
}

export default function DesignerWorkspace() {
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDesignsAndTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const [designsRes, templatesRes] = await Promise.all([
        fetch('/api/designs'),
        fetch('/api/templates')
      ]);

      if (!designsRes.ok) throw new Error('Failed to fetch designs');
      
      const [designsData, templatesData] = await Promise.all([
        designsRes.json(),
        templatesRes.json()
      ]);
      
      setDesigns(designsData);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Error fetching workspace data:', error);
      toast.error('Failed to load your workspace');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesignsAndTemplates();
  }, [fetchDesignsAndTemplates]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/designs/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete design');
      
      setDesigns(prev => prev.filter(d => d.id !== deleteId));
      toast.success('Design deleted successfully');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredDesigns = designs.filter(design => 
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-8 md:pt-6">
      <PageHero
        title="Designer Workspace"
        breadcrumb={['Content Creation', 'Designer']}
        icon={Palette}
        description="Manage your past designs or start something fresh from scratch."
        stats={[
          { label: 'Designs', value: loading ? '—' : designs.length, icon: LayoutGrid },
          { label: 'Templates', value: loading ? '—' : templates.length, icon: ImageIcon },
        ]}
        actions={
          <button onClick={() => router.push('/dashboard/designer/new')} className={heroButtonClass('gold')}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New design
          </button>
        }
        overlap={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search your designs..."
              className="h-11 rounded-xl pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[280px] rounded-3xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {templates.length > 0 && (
            <div className="space-y-4 mb-12">
              <SectionHeader label="Templates" title="Start from a template" className="mb-0" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="ae-tile ae-tile-interactive group cursor-pointer gap-0 py-0"
                    onClick={() => {
                        // Templates open directly into the editor. You could also pass template=id later if API supports
                        toast.error("Please load templates from the Designer sidebar to apply them correctly");
                        // router.push(`/dashboard/designer/new?templateId=${template.id}`) 
                    }}
                  >
                    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                      {(template.thumbnail_url || template.preview_url) ? (
                        <img 
                          src={(template.thumbnail_url || template.preview_url) as string} 
                          alt={template.name}
                          className="w-full h-full object-contain bg-zinc-100 group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                          <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Preview</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-bold">
                          <Plus className="w-4 h-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-xs font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <SectionHeader label="Your work" title="Your designs" className="mb-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create New Card */}
          <button 
            onClick={() => router.push('/dashboard/designer/new')}
            className="group flex h-full min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gold-300 bg-gold-50/60 transition-all duration-300 hover:border-gold-500 hover:bg-gold-50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 shadow-md transition-all group-hover:scale-110">
              <Plus className="h-7 w-7 text-brand-950" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-zinc-900">Create from Scratch</span>
              <span className="text-xs text-zinc-500">Start with a blank canvas</span>
            </div>
          </button>

          {/* Design Cards */}
          {filteredDesigns.map((design) => (
            <Card key={design.id} className="ae-tile ae-tile-interactive group gap-0 py-0">
              <div 
                className="relative m-2 mb-0 aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-zinc-100"
                onClick={() => router.push(`/dashboard/designer/${design.id}`)}
              >
                {design.preview_url ? (
                  <img 
                    src={design.preview_url} 
                    alt={design.name}
                    className="w-full h-full object-contain bg-zinc-100 group-hover:scale-110 transition-transform duration-500 p-2"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <ImageIcon className="w-12 h-12" strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase tracking-wider">No Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button size="sm" className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-full font-bold">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">
                      {design.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(design.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-zinc-200 shadow-xl">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/designer/${design.id}`)} className="cursor-pointer font-medium">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Title
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-rose-600 cursor-pointer font-medium focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setDeleteId(design.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Design
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
              <CardFooter className="border-t border-dashed border-zinc-200 px-4 py-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {design.width}x{design.height} px
                </span>
              </CardFooter>
            </Card>
          ))}
            </div>
          </div>
        </>
      )}

      {!loading && searchQuery && filteredDesigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No designs found</h3>
          <p className="text-zinc-500 max-w-xs mt-2">
            We couldn't find any designs matching "{searchQuery}".
          </p>
          <Button 
            variant="link" 
            className="mt-4 text-indigo-600"
            onClick={() => setSearchQuery('')}
          >
            Clear search filter
          </Button>
        </div>
      )}

      {!loading && filteredDesigns.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6">
            <LayoutGrid className="w-10 h-10 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Your workspace is empty</h3>
          <p className="text-zinc-500 max-w-xs mt-2">
            Create your first design to see it here!
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-rose-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-zinc-900 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              Delete Design?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-zinc-500">
              This action cannot be undone. This design will be permanently removed from your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl border-zinc-200 font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Design'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
