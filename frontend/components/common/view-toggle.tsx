'use client';

import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewType = 'card' | 'list';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn('inline-flex rounded-md border border-gray-300 bg-white p-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('card')}
        className={cn(
          'h-8 px-3',
          view === 'card'
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <LayoutGrid className="h-4 w-4 mr-1.5" />
        Card
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-8 px-3',
          view === 'list'
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        <List className="h-4 w-4 mr-1.5" />
        List
      </Button>
    </div>
  );
}

