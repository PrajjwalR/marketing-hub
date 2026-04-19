'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { DesignerEditor } from '@/components/designer/designer-editor';

export default function DesignPage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(id !== 'new');

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`/api/designs/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setInitialData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col gap-4 p-8">
        <Skeleton className="h-14 w-full" />
        <div className="flex-1 flex gap-4">
          <Skeleton className="h-full w-72" />
          <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <DesignerEditor 
        designId={id === 'new' ? undefined : (id as string)} 
        initialData={initialData} 
      />
    </div>
  );
}
